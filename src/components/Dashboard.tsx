import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Users, CopyCheck, FileText } from 'lucide-react';
import type { MemberRecord } from '../types';
import { MessageCard } from './MessageCard';
import { generateMessage, buildBulkText } from '../messageTemplate';

interface DashboardProps {
  records: MemberRecord[];
  onClear: () => void;
  onToast: (msg: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ records, onClear, onToast }) => {
  const [search, setSearch] = useState('');

  const filtered = records.filter(r =>
    `${r.firstName} ${r.surname}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyAll = useCallback(async () => {
    const all = records.map(generateMessage);
    const text = buildBulkText(all);
    await navigator.clipboard.writeText(text);
    onToast(`All ${records.length} messages copied!`);
  }, [records, onToast]);

  const handleDownload = useCallback(() => {
    const all = records.map(generateMessage);
    const text = buildBulkText(all);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `green-score-messages-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Downloaded successfully!');
  }, [records, onToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Stats Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {[
          { icon: <Users size={20} className="text-emerald-600" />, label: 'Total Members', value: records.length },
          { icon: <FileText size={20} className="text-emerald-600" />, label: 'Showing', value: filtered.length },
          { icon: <CopyCheck size={20} className="text-emerald-600" />, label: 'Messages Ready', value: records.length },
        ].map(stat => (
          <div key={stat.label} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '24px',
            background: '#ffffff',
            border: '1px solid rgba(203,213,225,0.8)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0'
            }}>
              {stat.icon}
            </div>
            <div style={{ marginTop: '8px' }}>
              <p style={{
                fontSize: '32px',
                fontWeight: 900,
                color: '#1e293b',
                lineHeight: 1,
                margin: 0,
                fontFamily: 'Outfit, sans-serif'
              }}>{stat.value}</p>
              <p style={{
                color: '#64748b',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '8px 0 0 0'
              }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Global Action Bar ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="🔍  Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '15px',
              color: '#1e293b',
              outline: 'none',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          flexShrink: 0
        }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyAll} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#ffffff', border: '2px solid #e2e8f0', color: '#1e293b',
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold',
            cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <CopyCheck size={18} className="text-emerald-600" /> Copy All
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleDownload} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#ffffff', border: '2px solid #e2e8f0', color: '#1e293b',
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold',
            cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Download size={18} className="text-emerald-600" /> Download TXT
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClear} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#fef2f2', border: '2px solid #fecaca', color: '#b91c1c',
            padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold',
            cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Trash2 size={18} /> Clear
          </motion.button>
        </div>
      </div>

      {/* ── Messages Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '32px',
        marginTop: '48px',
        width: '100%',
        maxWidth: '1400px'
      }}>
        <AnimatePresence>
          {filtered.map((member, i) => (
            <MessageCard
              key={member.id}
              member={member}
              index={i}
              onCopied={(name) => onToast(`Copied message for ${name}`)}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && search && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 text-slate-500"
        >
          <p className="text-lg">No members match "{search}"</p>
          <p className="text-sm mt-1">Try a different name</p>
        </motion.div>
      )}
    </motion.div>
  );
};
