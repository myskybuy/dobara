'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getLocation, requireUser } from '@/lib/auth';
import { str } from '@/lib/format';

export async function applySellerAction(fd: FormData) {
  const user = await requireUser('/seller/apply');
  const loc = await getLocation();
  if (!loc) redirect('/location?next=/seller/apply');

  const fullName = str(fd.get('fullName')).replace(/\s+/g, ' ');
  const phone = str(fd.get('phone')).replace(/[^0-9]/g, '');
  const note = str(fd.get('note')).slice(0, 500);
  const acceptTerms = str(fd.get('acceptTerms')) === '1';
  const fail = (m: string): never => redirect('/seller/apply?error=' + encodeURIComponent(m));

  if (fullName.length < 2) fail('Please enter your full name.');
  if (phone.length < 10 || phone.length > 12) fail('Please enter a valid phone number.');
  if (note.length < 10) fail('Please tell us what you plan to sell (at least 10 characters).');
  if (!acceptTerms) fail('Please accept the seller terms to continue.');

  await db.user.update({
    where: { id: user.id },
    data: {
      name: fullName,
      sellerPhone: phone,
      sellerNote: note,
      sellerStatus: 'PENDING',
      sellerAppliedAt: new Date(),
      sellerRejectReason: null,
    },
  });
  redirect('/seller/apply?sent=1');
}
