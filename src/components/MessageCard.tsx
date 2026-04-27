import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import type { MemberRecord } from '../types';
import { generateMessage, buildWhatsAppUrl } from '../messageTemplate';

interface MessageCardProps {
  member: MemberRecord;
  index: number;
  onCopied: (name: string) => void;
}

/**
 * Strips WhatsApp bold markers (*text*) for the UI preview display only.
 * The raw `message` string (with asterisks) is still used for copy + WhatsApp.
 */
function stripWhatsAppMarkers(text: string): string {
  // Remove * used as bold markers in WhatsApp format
  return text.replace(/\*/g, '');
}

export const MessageCard: React.FC<MessageCardProps> = ({ member, index, onCopied }) => {
  const [copied, setCopied] = useState(false);

  // Raw message (with asterisks) goes to clipboard/WA
  const message = generateMessage(member);
  // Display message (no asterisks) for UI preview
  const displayMessage = stripWhatsAppMarkers(message);
  const initials = `${member.firstName[0] ?? '?'}${member.surname[0] ?? ''}`.toUpperCase();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      onCopied(`${member.firstName} ${member.surname}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = message;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message, member, onCopied]);

  const handleWhatsApp = useCallback(() => {
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  }, [message]);

  return (
    <motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
        border: '1px solid rgba(203,213,225,0.8)',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '400px'
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      layout
    >
      {/* ── HEADER ── */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '24px',
          flexShrink: 0,
          background: '#ffffff',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        {/* Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            background: '#ecfdf5',
            color: '#059669',
            border: '2px solid #a7f3d0',
            borderRadius: '50%',
            fontWeight: 'bold',
            fontSize: '18px',
            flexShrink: 0
          }}
        >
          {initials}
        </div>
        
        {/* Name Block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            color: '#1e293b', 
            fontSize: '18px', 
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2
          }}>
            {member.firstName} {member.surname}
          </h3>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '11px', 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            margin: '4px 0 0 0' 
          }}>
            Member #{String(index + 1).padStart(3, '0')}
          </p>
        </div>
      </div>

      {/* ── MESSAGE PREVIEW BODY ── */}
      <div 
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 24px',
          background: '#f8fafc'
        }}
      >
        {/* Inner Card Box */}
        <div 
          style={{
            position: 'relative',
            flexGrow: 1,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '32px 20px 20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          {/* Badge */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: '20px',
              transform: 'translateY(-50%)',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '6px 14px',
              borderRadius: '999px',
              whiteSpace: 'nowrap'
            }}
          >
            Message Preview
          </div>

          {/* Text Content */}
          <div 
            style={{
              color: '#334155',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: 1.8,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}
          >
            {displayMessage}
          </div>
        </div>
      </div>

      {/* ── FOOTER BUTTONS ── */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '24px',
          flexShrink: 0,
          background: '#ffffff',
          borderTop: '1px solid #f1f5f9'
        }}
      >
        {/* Copy Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleCopy}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 0',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: copied ? '2px solid #6ee7b7' : '2px solid #e2e8f0',
            background: copied ? '#ecfdf5' : '#ffffff',
            color: copied ? '#065f46' : '#334155',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Message'}
        </motion.button>

        {/* WhatsApp Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleWhatsApp}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 0',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(16,185,129,0.2)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Send on WhatsApp
        </motion.button>
      </div>
    </motion.div>
  );
};
