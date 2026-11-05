import nodemailer from 'nodemailer';

export const smtpConfigured = () => !!process.env.SMTP_HOST;

/** `.test` is a reserved TLD (the demo accounts use @dobara.test) — mail to it can never be delivered. */
export const isUndeliverable = (to: string) => to.toLowerCase().endsWith('.test');

/**
 * Sends an email. When SMTP is not configured (local development), or the address can't
 * receive mail (demo accounts), the message is printed in the terminal instead.
 */
export async function sendMail(to: string, subject: string, text: string, html?: string) {
  if (!smtpConfigured() || isUndeliverable(to)) {
    console.log('\n──────── DOBARA EMAIL (dev, not sent) ────────');
    console.log('To:      ' + to);
    console.log('Subject: ' + subject);
    console.log(text);
    console.log('──────────────────────────────────────────────\n');
    return;
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
}
