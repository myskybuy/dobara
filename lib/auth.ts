import crypto from 'crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';
import { isValidLocation } from './constants';

const SESSION_COOKIE = 'dobara_session';
const LOC_COOKIE = 'dobara_loc';
const SESSION_DAYS = 30;

/** Current logged-in user (or null). Cached for one request. */
export const getUser = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt < new Date() || session.user.isBlocked) return null;
  return session.user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

/** Use in pages / actions that need a login. Sends guests to /login and comes back after. */
export async function requireUser(next = '/') {
  const user = await getUser();
  if (!user) redirect('/login?next=' + encodeURIComponent(next));
  return user;
}

export async function requireAdmin() {
  const user = await requireUser('/admin');
  if (!user.isAdmin) redirect('/');
  return user;
}

/** Call only from a Server Action or Route Handler (sets a cookie). */
export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', expires: expiresAt });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { token } });
  jar.delete(SESSION_COOKIE);
}

/* ---------- Location (asked once) ---------- */

export type Loc = { city: string; area: string };

/** Location of the logged-in user, or of the guest (cookie). */
export async function getLocation(): Promise<Loc | null> {
  const user = await getUser();
  if (user?.city && user.area) return { city: user.city, area: user.area };
  const raw = (await cookies()).get(LOC_COOKIE)?.value;
  if (!raw) return null;
  const [city, area] = decodeURIComponent(raw).split('|');
  return city && area && isValidLocation(city, area) ? { city, area } : null;
}

/** Saves the location on the user (if logged in) and in a cookie. Server Action / Route Handler only. */
export async function saveLocation(loc: Loc) {
  const user = await getUser();
  if (user) await db.user.update({ where: { id: user.id }, data: { city: loc.city, area: loc.area } });
  (await cookies()).set(LOC_COOKIE, encodeURIComponent(loc.city + '|' + loc.area), { path: '/', maxAge: 365 * 86_400, sameSite: 'lax' });
}

/** Guest picked a location before logging in: copy it to the account. */
export async function copyGuestLocationTo(userId: string) {
  const raw = (await cookies()).get(LOC_COOKIE)?.value;
  if (!raw) return;
  const [city, area] = decodeURIComponent(raw).split('|');
  if (city && area && isValidLocation(city, area)) {
    const u = await db.user.findUnique({ where: { id: userId } });
    if (u && !u.city) await db.user.update({ where: { id: userId }, data: { city, area } });
  }
}

/** Only allow internal redirect targets. */
export function safeNext(next: string | null | undefined, fallback = '/') {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
