import crypto from 'crypto';
import { db } from './db';
import { sendMail, smtpConfigured } from './mail';

const OTP_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;

export const hash = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
export const randomDigits = (n: number) => Array.from({ length: n }, () => crypto.randomInt(0, 10)).join('');

export function normaliseEmail(e: string) {
  return e.trim().toLowerCase();
}

export function isEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

/** Creates a 6-digit code, stores its hash and emails it. Returns the code only in dev mode (no SMTP). */
export async function createAndSendOtp(email: string, purpose: 'login' | 'signup', name?: string) {
  const code = randomDigits(6);
  await db.emailOtp.updateMany({ where: { email, usedAt: null }, data: { usedAt: new Date() } }); // old codes stop working
  await db.emailOtp.create({
    data: { email, purpose, name: name || null, codeHash: hash(email + ':' + code), expiresAt: new Date(Date.now() + OTP_TTL_MIN * 60_000) },
  });
  const subject = `${code} is your Dobara verification code`;
  const text = `Your Dobara verification code is ${code}.\nIt expires in ${OTP_TTL_MIN} minutes. If you did not request it, you can ignore this email.`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#161A27"><p>Your Dobara verification code is</p><p style="font-size:30px;font-weight:700;letter-spacing:6px;color:#3B35C3">${code}</p><p>It expires in ${OTP_TTL_MIN} minutes. If you did not request it, you can ignore this email.</p></div>`;
  await sendMail(email, subject, text, html);
  return smtpConfigured() || process.env.NODE_ENV === 'production' ? null : code;
}

export type OtpCheck = { ok: true; purpose: string; name: string | null } | { ok: false; error: string };

export async function verifyOtp(email: string, code: string): Promise<OtpCheck> {
  const otp = await db.emailOtp.findFirst({ where: { email, usedAt: null }, orderBy: { createdAt: 'desc' } });
  if (!otp) return { ok: false, error: 'This code has expired. Please request a new one.' };
  if (otp.expiresAt < new Date()) return { ok: false, error: 'This code has expired. Please request a new one.' };
  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false, error: 'Too many wrong attempts. Please request a new code.' };
  if (otp.codeHash !== hash(email + ':' + code)) {
    await db.emailOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: 'That code is not correct. Please check and try again.' };
  }
  await db.emailOtp.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  return { ok: true, purpose: otp.purpose, name: otp.name };
}
