// ============================================================
// types.ts — Shared TypeScript interfaces for Emerald Shift
// ============================================================

/**
 * Represents a single parsed member record from the uploaded report.
 * Each field maps to a specific column index in the source spreadsheet.
 */
export interface MemberRecord {
  /** Unique runtime ID for React keying */
  id: string;
  /** Index 0 — Member's first name */
  firstName: string;
  /** Index 1 — Member's surname */
  surname: string;
  /** Index 7 — Referrals shortfall value (raw string preserved) */
  referralsShortfall: string;
  /** Index 8 — 121's shortfall value (raw string preserved) */
  onetwooneShortfall: string;
  /** Index 9 — Business (TYFCB) shortfall, formatted in Indian numbering */
  businessShortfall: string;
  /** Index 10 — Visitors shortfall value (raw string preserved) */
  visitorsShortfall: string;
  /** Index 11 — Training shortfall value (raw string preserved) */
  trainingShortfall: string;
}

/**
 * Result object returned by the file-parsing pipeline.
 * Contains either a successful list of records or an error message.
 */
export interface ParseResult {
  success: boolean;
  records: MemberRecord[];
  error?: string;
  fileName: string;
  totalRows: number;
}
