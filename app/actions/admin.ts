'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { str } from '@/lib/format';
import { cancelOrder, completeOrder } from '@/lib/orders';

export async function toggleBlockAction(fd: FormData) {
  const admin = await requireAdmin();
  const id = str(fd.get('id'));
  if (id === admin.id) redirect('/admin/users?error=' + encodeURIComponent('You cannot block yourself.'));
  const u = await db.user.findUnique({ where: { id } });
  if (u) {
    await db.user.update({ where: { id }, data: { isBlocked: !u.isBlocked } });
    if (!u.isBlocked) {
      await db.session.deleteMany({ where: { userId: id } }); // log them out
      await db.listing.updateMany({ where: { sellerId: id, status: { in: ['ACTIVE', 'PENDING_REVIEW'] } }, data: { status: 'REJECTED', rejectReason: 'Seller account blocked' } });
    }
  }
  redirect('/admin/users' + (str(fd.get('q')) ? '?q=' + encodeURIComponent(str(fd.get('q'))) : ''));
}

/** Cancel an order and (in this simple version) mark it refunded. Listing goes live again. */
export async function adminCancelOrderAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'));
  const o = await db.order.findUnique({ where: { id } });
  if (o && !['COMPLETED', 'CANCELLED', 'PENDING_PAYMENT'].includes(o.status)) {
    await cancelOrder(id, 'cancelled by Dobara support. The payment will be refunded.');
  }
  redirect('/admin/orders');
}

export async function markPayoutPaidAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'));
  await db.payout.update({ where: { id }, data: { status: 'PAID', paidAt: new Date() } });
  redirect('/admin/orders?tab=payouts');
}

/* ---------- Admin: seller approval ---------- */

export async function approveSellerAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'));
  const back = str(fd.get('back')) || '/admin/sellers?tab=APPROVED';
  await db.user.update({ where: { id }, data: { sellerStatus: 'APPROVED', sellerRejectReason: null } });
  redirect(back);
}

export async function rejectSellerAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'));
  const reason = str(fd.get('reason')) || 'Does not meet our seller requirements right now.';
  await db.user.update({ where: { id }, data: { sellerStatus: 'REJECTED', sellerRejectReason: reason } });
  redirect('/admin/sellers?tab=PENDING');
}

export async function resolveContactMessageAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'));
  await db.contactMessage.update({ where: { id }, data: { resolved: true } });
  redirect('/admin/complaints?done=1');
}

export async function resolveComplaintAction(fd: FormData) {
  await requireAdmin();
  const id = str(fd.get('id'));
  const outcome = str(fd.get('outcome')) === 'refund_buyer' ? 'refund_buyer' : 'release_seller';
  const note = str(fd.get('note')).slice(0, 500);
  const c = await db.complaint.findUnique({ where: { id }, include: { order: true } });
  if (!c || c.status !== 'OPEN') redirect('/admin/complaints');
  if (c.order.status !== 'ISSUE_REPORTED') {
    await db.complaint.update({ where: { id }, data: { status: 'RESOLVED', outcome: 'refund_buyer', adminNote: 'Order was already cancelled.' } });
    redirect('/admin/complaints?done=1');
  }
  const adminNote = note || (outcome === 'refund_buyer' ? 'Refund approved.' : 'Payment released to the seller.');
  if (outcome === 'refund_buyer') {
    // Buyer keeps no item (return arranged offline) — order cancelled and refunded. Listing is not re-opened automatically.
    await db.order.update({ where: { id: c.orderId }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
  } else {
    await completeOrder(c.orderId);
  }
  await db.complaint.update({ where: { id }, data: { status: 'RESOLVED', outcome, adminNote } });
  redirect('/admin/complaints?done=1');
}
