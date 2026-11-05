'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getUser, requireAdmin } from '@/lib/auth';
import { str } from '@/lib/format';

export async function deleteListingAction(fd: FormData) {
  const id = str(fd.get('id'));
  const user = await getUser();
  if (!user) redirect('/login?next=/seller/listings');
  const l = await db.listing.findUnique({ where: { id }, include: { _count: { select: { orders: true } } } });
  if (!l || l.sellerId !== user.id) redirect('/seller/listings');
  if (l._count.orders > 0 || l.status === 'SOLD') redirect('/seller/listings?error=' + encodeURIComponent('This item has an order, so it cannot be removed.'));
  if (l.status === 'RESERVED') redirect('/seller/listings?error=' + encodeURIComponent('This item is reserved for a buyer. Cancel the deal in the chat first.'));
  await db.listing.delete({ where: { id } });
  redirect('/seller/listings?removed=1');
}

/* ---------- Admin: listing approval ---------- */

/** Only follow `back` inside the admin area (it comes from a hidden form field). */
const adminBack = (v: string, fallback: string) => (/^\/admin(\/|\?|$)/.test(v) ? v : fallback);

export async function approveListingAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'));
  const back = adminBack(str(fd.get('back')), '/admin/listings');
  await db.listing.update({ where: { id }, data: { status: 'ACTIVE', rejectReason: null } });
  redirect(back);
}

export async function rejectListingAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'));
  const reason = str(fd.get('reason')) || 'Does not follow our listing rules';
  await db.listing.update({ where: { id }, data: { status: 'REJECTED', rejectReason: reason } });
  redirect(adminBack(str(fd.get('back')), '/admin/listings?tab=PENDING_REVIEW'));
}
