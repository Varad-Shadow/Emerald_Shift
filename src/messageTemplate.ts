// ============================================================
// messageTemplate.ts — WhatsApp message generator
// ============================================================

import type { MemberRecord } from './types';

/**
 * Generates the exact WhatsApp message text for a given member record.
 *
 * The template preserves all emoji, bold markers (*text*), and line breaks
 * exactly as they should appear in WhatsApp.
 *
 * @param member - A sanitized MemberRecord from the parser.
 * @returns Formatted multi-line string ready for clipboard or URL encoding.
 */
export function generateMessage(member: MemberRecord): string {
  return `📊 *Green Score Shortfall Tracker* 📊

Dear Member,
${member.firstName} ${member.surname}

Please check your current shortfall and take action this week:

🔸 Referrals: ${member.referralsShortfall}
🔸 121's: ${member.onetwooneShortfall}
🔸 TYFCB (Business): ${member.businessShortfall}
🔸 Visitors: ${member.visitorsShortfall}
🔸 Training: ${member.trainingShortfall}

💡 *Action = Growth → Growth = Green* 💚

Let's close these gaps and move towards *Green Zone* 🚀

— Snehal Kalugade
Green Coordinator`;
}

/**
 * URL-encodes a message string for use in the wa.me deep-link.
 *
 * WhatsApp requires the message to be percent-encoded.
 * encodeURIComponent handles emojis, newlines (\n → %0A), and special chars.
 *
 * @param message - Raw message string (from generateMessage).
 * @returns URL-safe encoded string for the WhatsApp link.
 */
export function encodeForWhatsApp(message: string): string {
  return encodeURIComponent(message);
}

/**
 * Builds the complete wa.me URL for opening WhatsApp with a pre-filled message.
 *
 * @param message - Raw message string (will be encoded internally).
 * @returns Full WhatsApp URL.
 */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeForWhatsApp(message)}`;
}

/**
 * Concatenates all messages into a single TXT blob for bulk download.
 *
 * Each message is separated by a clear divider line.
 *
 * @param messages - Array of formatted message strings.
 * @returns A single string suitable for a .txt download.
 */
export function buildBulkText(messages: string[]): string {
  const divider = '\n' + '═'.repeat(50) + '\n';
  return messages.join(divider);
}
