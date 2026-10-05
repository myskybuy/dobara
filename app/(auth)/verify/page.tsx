import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { resendOtpAction, verifyAction } from '@/app/actions/auth';
import { safeNext } from '@/lib/auth';
import { FormError, Ic } from '@/components/ui';
import { OtpInput } from '@/components/OtpInput';

export const metadata = { title: 'Verify your email' };

type SP = Promise<{ next?: string; error?: string }>;

export default async function VerifyPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const jar = await cookies();
  const email = jar.get('dobara_pending')?.value;
  const devCode = jar.get('dobara_dev_otp')?.value;
  if (!email) redirect('/login?next=' + encodeURIComponent(next));

  return (
    <section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div className="card pad-l col g20" style={{ width: '100%', maxWidth: 460 }}>
        <Link className="icon-btn bd sm" aria-label="Back" href={`/login?next=${encodeURIComponent(next)}`}><Ic n="chevl" s="sm" /></Link>
        <div className="col g6">
          <div className="h2">Enter the code</div>
          <p className="soft">We sent a 6-digit code to <b>{email}</b>. It expires in 10 minutes.</p>
        </div>
        <FormError msg={sp.error} />
        {devCode && (
          <div className="dev-otp"><b>Dev mode:</b> email is not set up, so here is your code: <b style={{ letterSpacing: 2 }}>{devCode}</b> (also printed in the terminal).</div>
        )}
        <form action={verifyAction} className="col g20">
          <input type="hidden" name="next" value={next} />
          <OtpInput />
          <button className="btn btn-pri btn-lg btn-block" type="submit">Verify &amp; continue</button>
        </form>
        <form action={resendOtpAction} className="row between wrapf g8">
          <input type="hidden" name="next" value={next} />
          <span className="t-sm muted">Didn’t get it? Check spam, or</span>
          <button className="linkbtn" type="submit">Send a new code</button>
        </form>
      </div>
    </section>
  );
}
