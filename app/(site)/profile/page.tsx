import Link from 'next/link';
import { logoutAction, updateProfileAction } from '@/app/actions/auth';
import { requireUser } from '@/lib/auth';
import { avatarCls, initials } from '@/lib/format';
import { FormError, Ic, Notice } from '@/components/ui';

export const metadata = { title: 'Profile' };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/profile');
  return (
    <div className="container" style={{ maxWidth: 760, paddingTop: 24, paddingBottom: 48 }}>
      <div className="h2" style={{ marginBottom: 16 }}>Profile</div>
      <form action={updateProfileAction} className="card pad-l col g20">
        <div className="row g16">
          <span className={avatarCls(user.name) + ' xl'}>{initials(user.name)}</span>
          <div className="col g4"><b className="t-lg">{user.name}</b><span className="badge b-teal" style={{ alignSelf: 'flex-start' }}><Ic n="mail" s="xs" />Email verified</span></div>
        </div>
        <FormError msg={sp.error} />
        {sp.saved && <Notice kind="teal">Your profile has been saved.</Notice>}
        <div className="grid2" style={{ gap: 16 }}>
          <label className="col g6"><span className="label">Full name</span><input className="input" name="name" defaultValue={user.name} required minLength={2} /></label>
          <label className="col g6"><span className="label">Email</span><input className="input" value={user.email} disabled aria-label="Email" /></label>
        </div>
        <label className="col g6"><span className="label">Delivery address</span><textarea className="textarea" name="address" rows={2} defaultValue={user.address ?? ''} placeholder="House / flat, building, street, area, city, PIN" /></label>
        <div className="row between wrapf g12" style={{ paddingTop: 4 }}>
          <span className="t-sm muted">Your area: <b>{user.area ? `${user.area}, ${user.city}` : 'not set'}</b> · <Link href="/location?next=/profile">Change</Link></span>
          <button className="btn btn-pri" type="submit">Save changes</button>
        </div>
      </form>
      <div className="card" style={{ overflow: 'hidden', marginTop: 16 }}>
        <Link className="menu-i" href="/orders"><span className="mi-ic"><Ic n="package" /></span><span className="grow">My orders</span><Ic n="chevr" s="sm" className="muted" /></Link>
        <Link className="menu-i" href="/chat"><span className="mi-ic"><Ic n="chat" /></span><span className="grow">Chats</span><Ic n="chevr" s="sm" className="muted" /></Link>
        <Link className="menu-i" href="/seller"><span className="mi-ic" style={{ background: 'var(--amber-50)', color: 'var(--amber-ink)' }}><Ic n="store" /></span><span className="grow">My listings (sell)</span><Ic n="chevr" s="sm" className="muted" /></Link>
        <form action={logoutAction}>
          <button className="menu-i" type="submit"><span className="mi-ic" style={{ background: 'var(--red-50)', color: 'var(--red)' }}><Ic n="logout" /></span><span className="grow c-red" style={{ textAlign: 'left' }}>Log out</span></button>
        </form>
      </div>
    </div>
  );
}
