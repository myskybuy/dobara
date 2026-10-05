import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signupAction } from '@/app/actions/auth';
import { getUser, safeNext } from '@/lib/auth';
import { FormError } from '@/components/ui';

export const metadata = { title: 'Sign up' };

type SP = Promise<{ next?: string; error?: string; email?: string }>;

export default async function SignupPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getUser()) redirect(next);
  return (
    <section style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <form action={signupAction} className="card pad-l col g20" style={{ width: '100%', maxWidth: 440 }}>
        <div className="col g6">
          <div className="h2">Create your account</div>
          <p className="soft">Buy and sell pre-loved things near you. We will email you a code to verify your address.</p>
        </div>
        <FormError msg={sp.error} />
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label className="label" htmlFor="su-n">Full name</label>
          <input id="su-n" className="input" name="name" required minLength={2} autoComplete="name" placeholder="Aarav Mehta" />
        </div>
        <div className="field">
          <label className="label" htmlFor="su-e">Email address</label>
          <input id="su-e" className="input" type="email" name="email" required autoComplete="email" placeholder="you@example.com" defaultValue={sp.email || ''} />
        </div>
        <button className="btn btn-pri btn-lg btn-block" type="submit">Send verification code</button>
        <p className="t-xs muted" style={{ textAlign: 'center' }}>
          By continuing you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy policy</Link>.
        </p>
        <p className="t-sm soft" style={{ textAlign: 'center' }}>
          Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
        </p>
      </form>
    </section>
  );
}
