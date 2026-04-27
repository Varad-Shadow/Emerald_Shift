import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Zap, MessageCircle } from 'lucide-react';
import type { ParseResult, MemberRecord } from './types';
import { DropZone } from './components/DropZone';
import { Dashboard } from './components/Dashboard';
import { Toast } from './components/Toast';

// ── Ambient orbs (decorative) ─────────────────────────────────────────────────
const Orb: React.FC<{ className: string }> = ({ className }) => (
  <div className={`orb ${className}`} aria-hidden="true" />
);

// ── Toast state helper ────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '' });
  const show = useCallback((message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);
  return { toast, show };
}

// ── Main App ──────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [records, setRecords] = useState<MemberRecord[]>([]);
  const [fileName, setFileName] = useState('');
  const [hasData, setHasData] = useState(false);
  const { toast, show: showToast } = useToast();

  const handleParsed = useCallback((result: ParseResult) => {
    if (result.success && result.records.length > 0) {
      setRecords(result.records);
      setFileName(result.fileName);
      setHasData(true);
      showToast(`✅ ${result.records.length} member records loaded!`);
    }
  }, [showToast]);

  const handleClear = useCallback(() => {
    setRecords([]);
    setFileName('');
    setHasData(false);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.10) 0%, transparent 60%), #F8FAFC',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Soft ambient orbs */}
      <Orb className="orb-1" />
      <Orb className="orb-2" />
      <Orb className="orb-3" />

      {/* ── Page content wrapper — CSS class handles centering ── */}
      <div className="page-content" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="hero-section"
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
            className="stat-badge"
            style={{ display: 'inline-flex', marginBottom: 24 }}
          >
            <Leaf size={13} />
            <span>Data-to-Message Automation Engine</span>
          </motion.div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(42px, 7vw, 80px)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #065f46 0%, #059669 45%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 20,
            }}
          >
            Emerald Shift
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.05rem',
              color: '#64748b',
              fontWeight: 500,
              maxWidth: 500,
              margin: '0 auto 32px',
              lineHeight: 1.7,
            }}
          >
            Turn raw metrics into momentum. Convert your performance report into
            ready-to-send, actionable WhatsApp nudges — instantly.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {[
              { icon: '✨', label: 'Smart Financial Localization' },
              { Icon: Zap, label: 'Zero-Click Parsing' },
              { Icon: MessageCircle, label: 'One-Click Routing' },
            ].map(({ icon, label, Icon }: { icon?: string; label: string; Icon?: React.ComponentType<{ size: number }> }) => (
              <span
                key={label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: 'rgba(16,185,129,0.07)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  color: '#059669',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {icon ?? (Icon && <Icon size={13} />)}
                {label}
              </span>
            ))}
          </div>
        </motion.header>

        {/* ── UPLOAD SECTION ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          style={{ width: '100%' }}
          aria-label="File upload section"
        >
          <DropZone
            onParsed={handleParsed}
            onClear={handleClear}
            hasData={hasData}
            fileName={fileName}
          />
        </motion.section>

        {/* ── DASHBOARD SECTION ───────────────────────────────── */}
        <AnimatePresence>
          {hasData && records.length > 0 && (
            <motion.section
              key="dashboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%' }}
              aria-label="Generated messages dashboard"
            >
              <div className="section-divider" />

              {/* Dashboard label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Leaf size={17} color="#059669" />
                </div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: '#1e293b' }}>
                  Generated Messages
                  <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 400, color: '#10b981' }}>
                    {records.length} member{records.length !== 1 ? 's' : ''}
                  </span>
                </h2>
              </div>

              <Dashboard
                records={records}
                onClear={handleClear}
                onToast={showToast}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <footer style={{ textAlign: 'center', marginTop: 80, color: '#94a3b8', fontSize: 12 }}>
          <p style={{ fontWeight: 600, color: '#64748b' }}>Emerald Shift</p>
          <p style={{ marginTop: 4 }}>Secure Local Processing • Zero Data Uploaded</p>
        </footer>
      </div>

      {/* Toast */}
      <Toast visible={toast.visible} message={toast.message} />
    </main>
  );
};

export default App;
