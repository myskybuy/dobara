'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { copyGuestLocationTo, createSession, destroySession, getUser, safeNext, saveLocation } from '@/lib/auth';
import { createAndSendOtp, isEmail, normaliseEmail, verifyOtp } from '@/lib/otp';
import { isValidLocation } from '@/lib/constants';
import { str } from '@/lib/format';

const PENDING = 'dobara_pending';   // email waiting for OTP
const DEV_CODE = 'dobara_dev_otp';  // dev only: show the code on screen when no SMTP is set

function back(path: string, error: string, extra = ''): never {
  redirect(`${path}?error=${encodeURIComponent(error)}${extra}`);
}

async function startOtp(email: string, purpose: 'login' | 'signup', next: string, name?: string) {
  const devCode = await createAndSendOtp(email, purpose, name);
  const jar = await cookies();
  jar.set(PENDING, email, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 15 * 60 });
  if (devCode) jar.set(DEV_CODE, devCode, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 15 * 60 });
  else jar.delete(DEV_CODE);
  redirect('/verify?next=' + encodeURIComponent(next));
}

export async function loginAction(fd: FormData) {
  const email = normaliseEmail(str(fd.get('email')));
  const next = safeNext(str(fd.get('next')));
  const n = '&next=' + encodeURIComponent(next);
  if (!isEmail(email)) back('/login', 'Please enter a valid email address.', n);
  const user = await db.user.findUnique({ where: { email } });
  if (!user) back('/login', 'No account with this email yet. Please sign up first.', n + '&signup=1&email=' + encodeURIComponent(email));
  if (user!.isBlocked) back('/login', 'This account has been blocked. Please contact support.', n);
  await startOtp(email, 'login', next);
}

export async function signupAction(fd: FormData) {
  const name = str(fd.get('name')).replace(/\s+/g, ' ');
  const email = normaliseEmail(str(fd.get('email')));
  const next = safeNext(str(fd.get('next')));
  const n = '&next=' + encodeURIComponent(next);
  if (name.length < 2) back('/signup', 'Please enter your full name.', n);
  if (!isEmail(email)) back('/signup', 'Please enter a valid email address.', n);
  if (await db.user.findUnique({ where: { email } })) back('/login', 'This email is already registered. Please log in.', n + '&email=' + encodeURIComponent(email));
  await startOtp(email, 'signup', next, name);
}

export async function verifyAction(fd: FormData) {
  const jar = await cookies();
  const email = jar.get(PENDING)?.value;
  const next = safeNext(str(fd.get('next')));
  const code = str(fd.get('code')).replace(/\D/g, '');
  if (!email) back('/login', 'Your code expired. Please enter your email again.');
  if (code.length !== 6) back('/verify', 'Please enter the 6-digit code.', '&next=' + encodeURIComponent(next));

  const res = await verifyOtp(email!, code);
  if (!res.ok) back('/verify', res.error, '&next=' + encodeURIComponent(next));

  let user = await db.user.findUnique({ where: { email: email! } });
  if (!user) {
    const name = (res.ok && res.name) || email!.split('@')[0]!;
    user = await db.user.create({ data: { email: email!, name } });
  }
  if (user.isBlocked) back('/login', 'This account has been blocked. Please contact support.');

  await createSession(user.id);
  await copyGuestLocationTo(user.id);
  jar.delete(PENDING);
  jar.delete(DEV_CODE);

  const fresh = await db.user.findUnique({ where: { id: user.id } });
  if (!fresh?.city) redirect('/location?next=' + encodeURIComponent(next));
  redirect(next);
}

export async function resendOtpAction(fd: FormData) {
  const jar = await cookies();
  const email = jar.get(PENDING)?.value;
  const next = safeNext(str(fd.get('next')));
  if (!email) back('/login', 'Please enter your email again.');
  const last = await db.emailOtp.findFirst({ where: { email: email! }, orderBy: { createdAt: 'desc' } });
  if (last && Date.now() - last.createdAt.getTime() < 30_000) back('/verify', 'Please wait 30 seconds before asking for a new code.', '&next=' + encodeURIComponent(next));
  const exists = await db.user.findUnique({ where: { email: email! } });
  await startOtp(email!, exists ? 'login' : 'signup', next, last?.name ?? undefined);
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}

export async function setLocationAction(fd: FormData) {
  const [city, area] = str(fd.get('loc')).split('|');
  const next = safeNext(str(fd.get('next')));
  if (!city || !area || !isValidLocation(city, area)) back('/location', 'Please choose your area from the list.', '&next=' + encodeURIComponent(next));
  await saveLocation({ city: city!, area: area! });
  redirect(next);
}

export async function updateProfileAction(fd: FormData) {
  const user = await getUser();
  if (!user) redirect('/login?next=/profile');
  const name = str(fd.get('name')).replace(/\s+/g, ' ');
  const address = str(fd.get('address'));
  if (name.length < 2) redirect('/profile?error=' + encodeURIComponent('Please enter your full name.'));
  await db.user.update({ where: { id: user.id }, data: { name, address: address || null } });
  redirect('/profile?saved=1');
}
