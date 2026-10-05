'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { str } from '@/lib/format';
import { isEmail } from '@/lib/otp';

export async function contactAction(fd: FormData) {
  const name = str(fd.get('name'));
  const email = str(fd.get('email')).toLowerCase();
  const topic = str(fd.get('topic')) || 'Something else';
  const orderCode = str(fd.get('orderCode'));
  const message = str(fd.get('message')).slice(0, 1000);
  const fail = (m: string): never => redirect('/contact?error=' + encodeURIComponent(m));
  if (name.length < 2) fail('Please enter your name.');
  if (!isEmail(email)) fail('Please enter a valid email.');
  if (message.length < 10) fail('Please write a short message (at least 10 characters).');
  await db.contactMessage.create({ data: { name, email, topic, orderCode: orderCode || null, message } });
  redirect('/contact?sent=1');
}
