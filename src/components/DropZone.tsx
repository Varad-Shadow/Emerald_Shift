import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileCheck2, AlertCircle, X } from 'lucide-react';
import type { ParseResult } from '../types';
import { parseFile } from '../parser';

interface DropZoneProps {
  onParsed: (result: ParseResult) => void;
  onClear: () => void;
  hasData: boolean;
  fileName: string;
}

export const DropZone: React.FC<DropZoneProps> = ({ onParsed, onClear, hasData, fileName }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setLocalError(null);
    setIsLoading(true);
    try {
      const result = await parseFile(file);
      onParsed(result);
      if (!result.success) setLocalError(result.error ?? 'Unknown parse error.');
    } finally {
      setIsLoading(false);
    }
  }, [onParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }, [processFile]);

  /* ── SUCCESS STATE ─────────────────────────────────────── */
  if (hasData) {
    return (
      <motion.div
        className="drop-zone dz-success"
        style={{ padding: '20px 28px', marginBottom: 64, borderRadius: '1.25rem' }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="dz-success-row">
          <div className="dz-file-info">
            <div className="dz-file-icon">
              <FileCheck2 size={22} color="#10b981" />
            </div>
            <div>
              <p className="dz-file-name">{fileName}</p>
              <p className="dz-file-label">✦ Parsed &amp; ready — all messages generated</p>
            </div>
          </div>
          <button
            className="btn btn-danger"
            onClick={onClear}
            style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '10px' }}
          >
            <X size={13} /> Reset
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── LOADING STATE ─────────────────────────────────────── */
  if (isLoading) {
    return (
      <div
        className="drop-zone"
        style={{ cursor: 'default', pointerEvents: 'none', paddingTop: 96, paddingBottom: 96, paddingLeft: 40, paddingRight: 40, marginBottom: 96 }}
      >
        <div className="spin" />
        <p className="dz-title text-base">Processing your data file…</p>
        <p className="dz-sub">Parsing rows, formatting numbers, crafting messages</p>
      </div>
    );
  }

  /* ── IDLE / DRAG STATE ─────────────────────────────────── */
  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        id="file-upload-input"
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <motion.div
        className={`drop-zone group ${isDragging ? 'dz-over' : ''}`}
        style={{ paddingTop: 96, paddingBottom: 96, paddingLeft: 40, paddingRight: 40, marginBottom: 96 }}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        whileTap={{ scale: 0.995 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDragging ? 'over' : 'idle'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-7">
              <UploadCloud
                className={`w-20 h-20 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-2'}`}
                color={isDragging ? '#10b981' : '#059669'}
                strokeWidth={1.4}
              />
            </div>

            {/* Heading */}
            <p className="dz-title mb-3">
              {isDragging ? 'Release to parse your data file' : 'Drop your report to initiate the shift'}
            </p>

            {/* Sub */}
            <p className="dz-sub">
              {isDragging
                ? <span className="text-emerald-600 font-semibold">File detected — drop to parse instantly</span>
                : <>or <span className="text-emerald-600 font-semibold cursor-pointer underline underline-offset-4">click to browse</span> your file system</>
              }
              <br />
              <span className="text-slate-400 text-xs mt-2 block">
                Supports .xlsx and .csv • 100% secure local processing
              </span>
            </p>

            {/* Extension pills */}
            <div className="dz-ext-tags">
              {['.xlsx', '.xls', '.csv'].map(ext => (
                <span key={ext} className="dz-ext">{ext}</span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {localError && (
          <motion.div
            className="err-banner max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="err-title">Unable to Process File</p>
              <p className="err-body">{localError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
