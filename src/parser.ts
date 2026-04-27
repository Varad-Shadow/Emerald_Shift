// ============================================================
// parser.ts — File parsing pipeline for the Green Score report
// Supports both .xlsx (via SheetJS) and .csv (via PapaParse)
// ============================================================

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { MemberRecord, ParseResult } from './types';

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * The actual data rows start at Row 8 in the spreadsheet (1-indexed).
 * In a zero-based array, that is index 7.
 * Rows 0–6 are header/metadata rows that must be skipped.
 */
const DATA_START_INDEX = 7;

/**
 * Column index mapping from the performance report specification.
 * These indices correspond to columns AFTER the header rows are discarded.
 */
const COL = {
  FIRST_NAME: 0,
  SURNAME: 1,
  REFERRALS: 7,
  ONETWOOONE: 8,
  BUSINESS: 9,
  VISITORS: 10,
  TRAINING: 11,
} as const;

// ── Indian Numbering System Formatter ────────────────────────────────────────

/**
 * Formats a numeric string using the Indian numbering system.
 *
 * The Indian system groups the LAST three digits together, then every
 * subsequent group (moving left) consists of TWO digits.
 *
 * Examples:
 *   -1822500  → -18,22,500
 *   1000000   →  10,00,000
 *   500       →  500
 *   0         →  0
 *
 * @param rawValue - Raw string or number value from the spreadsheet cell.
 * @returns Formatted string in Indian numbering, or the original value if unparseable.
 */
export function formatIndianNumber(rawValue: string | number | null | undefined): string {
  if (rawValue === null || rawValue === undefined || rawValue === '') return '0';

  // Strip commas that may already exist in the cell (e.g. "1,822,500")
  const cleaned = String(rawValue).replace(/,/g, '').trim();

  // Attempt to parse as a floating-point number
  const num = parseFloat(cleaned);
  if (isNaN(num)) return String(rawValue); // Return original if not a number

  // Handle negative sign separately
  const isNegative = num < 0;
  const absStr = Math.abs(num).toFixed(0); // Integer part only

  // Apply Indian grouping:
  // Last 3 digits stay together; every 2 digits form a group to the left.
  const lastThree = absStr.slice(-3);
  const remaining = absStr.slice(0, -3);

  let formatted = lastThree;
  if (remaining.length > 0) {
    // Insert commas every 2 digits from the right of the remaining string
    const groups: string[] = [];
    let i = remaining.length;
    while (i > 0) {
      groups.unshift(remaining.slice(Math.max(0, i - 2), i));
      i -= 2;
    }
    formatted = groups.join(',') + ',' + lastThree;
  }

  return (isNegative ? '-' : '') + formatted;
}

// ── Row Sanitizer ─────────────────────────────────────────────────────────────

/**
 * Transforms a raw 2D array row (from SheetJS or PapaParse) into a
 * typed MemberRecord. Returns null if the row is empty or unusable.
 *
 * @param row    - Array of cell values for a single spreadsheet row.
 * @param index  - Row index (used to generate a unique ID).
 * @returns A MemberRecord or null if the row should be skipped.
 */
function sanitizeRow(row: unknown[], index: number): MemberRecord | null {
  // Helper: safely extract a string from any cell value
  const cell = (colIndex: number): string => {
    const val = row[colIndex];
    if (val === null || val === undefined) return '';
    return String(val).trim();
  };

  const firstName = cell(COL.FIRST_NAME);

  // Filter condition: skip rows where First Name is blank
  if (!firstName) return null;

  // Extract and format all required fields
  const businessRaw = cell(COL.BUSINESS);

  return {
    id: `member-${index}-${Date.now()}`,
    firstName,
    surname: cell(COL.SURNAME),
    referralsShortfall: cell(COL.REFERRALS) || '0',
    onetwooneShortfall: cell(COL.ONETWOOONE) || '0',
    businessShortfall: formatIndianNumber(businessRaw),
    visitorsShortfall: cell(COL.VISITORS) || '0',
    trainingShortfall: cell(COL.TRAINING) || '0',
  };
}

// ── Excel (.xlsx / .xls) Parser ──────────────────────────────────────────────

/**
 * Parses an Excel file buffer using SheetJS.
 *
 * Process:
 * 1. Read the ArrayBuffer with SheetJS (raw mode to preserve all values).
 * 2. Convert the first sheet to a 2D array (AOA = Array of Arrays).
 * 3. Slice from DATA_START_INDEX (row 8) onward.
 * 4. Sanitize each row into a MemberRecord.
 *
 * @param buffer   - Raw ArrayBuffer of the uploaded .xlsx file.
 * @param fileName - Original file name for the ParseResult.
 */
async function parseExcel(buffer: ArrayBuffer, fileName: string): Promise<ParseResult> {
  try {
    // SheetJS: read workbook from array buffer
    const workbook = XLSX.read(buffer, {
      type: 'array',
      raw: true,         // Keep raw cell values (numbers stay numbers)
      cellDates: false,  // Don't auto-convert dates
    });

    // Use the first sheet in the workbook
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        records: [],
        fileName,
        totalRows: 0,
        error: 'The uploaded file contains no sheets. Please upload a valid performance report.',
      };
    }

    const sheet = workbook.Sheets[sheetName];

    // Convert to Array of Arrays (AOA). Each inner array = one row.
    // defval: '' ensures missing cells become empty strings rather than undefined.
    const allRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      raw: true,
    });

    // Validate: ensure we actually have enough rows to contain data
    if (allRows.length <= DATA_START_INDEX) {
      return {
        success: false,
        records: [],
        fileName,
        totalRows: allRows.length,
        error: `Invalid file format. The report must have data starting at Row 8. Only ${allRows.length} row(s) found.`,
      };
    }

    // Slice off the header rows (rows 0–6), keep rows from index 7 onward
    const dataRows = allRows.slice(DATA_START_INDEX);

    // Sanitize each data row; filter out nulls (empty/invalid rows)
    const records: MemberRecord[] = dataRows
      .map((row, i) => sanitizeRow(row, i))
      .filter((r): r is MemberRecord => r !== null);

    if (records.length === 0) {
      return {
        success: false,
        records: [],
        fileName,
        totalRows: dataRows.length,
        error: 'No valid member records found after Row 8. Please verify the file format.',
      };
    }

    return {
      success: true,
      records,
      fileName,
      totalRows: dataRows.length,
    };

  } catch (err) {
    console.error('[parseExcel] Error:', err);
    return {
      success: false,
      records: [],
      fileName,
      totalRows: 0,
      error: 'Failed to read the Excel file. It may be corrupted or password-protected.',
    };
  }
}

// ── CSV Parser ───────────────────────────────────────────────────────────────

/**
 * Parses a CSV file string using PapaParse.
 *
 * Process:
 * 1. Parse the raw string into a 2D array (using header:false).
 * 2. Slice from DATA_START_INDEX (row 8) onward.
 * 3. Sanitize each row.
 *
 * @param text     - Raw UTF-8 string content of the uploaded .csv file.
 * @param fileName - Original file name for the ParseResult.
 */
async function parseCsv(text: string, fileName: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<string[]>(text, {
      header: false,       // Parse as AOA, not keyed objects
      skipEmptyLines: false, // Keep empty lines so row indices stay accurate
      complete: (results) => {
        const allRows = results.data as string[][];

        if (allRows.length <= DATA_START_INDEX) {
          resolve({
            success: false,
            records: [],
            fileName,
            totalRows: allRows.length,
            error: `Invalid file format. The report must have data starting at Row 8. Only ${allRows.length} row(s) found.`,
          });
          return;
        }

        const dataRows = allRows.slice(DATA_START_INDEX);
        const records: MemberRecord[] = dataRows
          .map((row, i) => sanitizeRow(row, i))
          .filter((r): r is MemberRecord => r !== null);

        if (records.length === 0) {
          resolve({
            success: false,
            records: [],
            fileName,
            totalRows: dataRows.length,
            error: 'No valid member records found in the CSV after Row 8.',
          });
          return;
        }

        resolve({ success: true, records, fileName, totalRows: dataRows.length });
      },
      error: (err: Error) => {
        resolve({
          success: false,
          records: [],
          fileName,
          totalRows: 0,
          error: `CSV parsing failed: ${err.message}`,
        });
      },
    });
  });
}

// ── Public Entry Point ───────────────────────────────────────────────────────

/**
 * Main file-parsing entry point. Detects the file type by extension
 * and delegates to the appropriate parser.
 *
 * @param file - The File object from the drag-and-drop or file input.
 * @returns A Promise resolving to a ParseResult.
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') {
    // Read the file as an ArrayBuffer for SheetJS
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer, file.name);
  }

  if (ext === 'csv') {
    // Read the file as text for PapaParse
    const text = await file.text();
    return parseCsv(text, file.name);
  }

  // Unsupported file type
  return {
    success: false,
    records: [],
    fileName: file.name,
    totalRows: 0,
    error: `Unsupported file type ".${ext ?? 'unknown'}". Please upload an .xlsx or .csv file.`,
  };
}
