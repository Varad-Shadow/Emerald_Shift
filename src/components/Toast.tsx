import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  visible: boolean;
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ visible, message }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.85 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 24px',
          background: 'rgba(16,185,129,0.96)',
          border: '1px solid rgba(52,211,153,0.4)',
          borderRadius: 9999,
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(16,185,129,0.35), 0 2px 8px rgba(0,0,0,0.08)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <CheckCircle2 size={16} />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);
