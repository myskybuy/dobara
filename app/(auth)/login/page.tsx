import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import { getUser, safeNext } from '@/lib/auth';
import { FormError } from '@/components/ui';

export const metadata = { title: 'Log in' };

type SP = Promise<{ next?: string; error?: string; email?: string; signup?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getUser()) redirect(next);
  return (
    <section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <form action={loginAction} className="card pad-l col g20" style={{ width: '100%', maxWidth: 440 }}>
        <div className="col g6">
          <div className="h2">Log in</div>
          <p className="soft">We will email you a one-time code to log in.</p>
        </div>
        <FormError msg={sp.error} />
        {sp.signup && (
          <Link className="btn btn-sec btn-block" href={`/signup?email=${encodeURIComponent(sp.email || '')}&next=${encodeURIComponent(next)}`}>Create an account with this email</Link>
        )}
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label className="label" htmlFor="lg-em">Email address</label>
          <input id="lg-em" className="input" type="email" name="email" required autoComplete="email" placeholder="you@example.com" defaultValue={sp.email || ''} />
          <span className="hint">Use the email linked to your Dobara account.</span>
        </div>
        <button className="btn btn-pri btn-lg btn-block" type="submit">Send code</button>
        <p className="t-sm soft" style={{ textAlign: 'center' }}>
          New to Dobara? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link>
        </p>
      </form>
    </section>
  );
}
