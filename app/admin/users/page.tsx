import type { Prisma } from '@prisma/client';
import { toggleBlockAction } from '@/app/actions/admin';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { avatarCls, fmtDate, initials } from '@/lib/format';
import { FormError, Ic } from '@/components/ui';

export const metadata = { title: 'Users' };

const COLS = 'minmax(0,2fr) 1.3fr 0.8fr 0.8fr 1fr 120px';

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; error?: string }> }) {
  const sp = await searchParams;
  const admin = await requireAdmin();
  const where: Prisma.UserWhereInput = sp.q ? { OR: [{ name: { contains: sp.q, mode: 'insensitive' } }, { email: { contains: sp.q, mode: 'insensitive' } }] } : {};
  const users = await db.user.findMany({
    where,
    include: { _count: { select: { listings: true, buyerOrders: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return (
    <div className="col g16">
      <div className="col" style={{ gap: 0 }}><div className="h2">Users</div><span className="soft">{users.length} shown</span></div>
      <FormError msg={sp.error} />
      <form className="inwrap" style={{ maxWidth: 380 }} action="/admin/users"><Ic n="search" s="sm" /><input className="input" style={{ height: 40 }} name="q" defaultValue={sp.q || ''} placeholder="Search name or email" aria-label="Search users" /></form>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="dt-scroll"><div className="dt-inner">
          <div className="dt-row dt-head" style={{ gridTemplateColumns: COLS }}><span>User</span><span>Area</span><span>Listings</span><span>Orders</span><span>Joined</span><span /></div>
          {users.map((u) => (
            <div key={u.id} className="dt-row" style={{ gridTemplateColumns: COLS }}>
              <span className="row g8" style={{ minWidth: 0 }}><span className={avatarCls(u.name) + ' sm'}>{initials(u.name)}</span><span className="col" style={{ gap: 0, minWidth: 0 }}><b className="clamp1">{u.name} {u.isAdmin && <span className="badge b-dark">Admin</span>}</b><span className="t-xs muted clamp1">{u.email}</span></span></span>
              <span className="clamp1">{u.area ? `${u.area}, ${u.city}` : '—'}</span>
              <span>{u._count.listings}</span>
              <span>{u._count.buyerOrders}</span>
              <span>{fmtDate(u.createdAt)}</span>
              <span>
                {u.id !== admin.id && (
                  <form action={toggleBlockAction}>
                    <input type="hidden" name="id" value={u.id} /><input type="hidden" name="q" value={sp.q || ''} />
                    <button className={'btn btn-xs ' + (u.isBlocked ? 'btn-sec' : 'btn-ghost c-red')} type="submit">{u.isBlocked ? 'Unblock' : 'Block'}</button>
                  </form>
                )}
                {u.isBlocked && <span className="badge b-red">Blocked</span>}
              </span>
            </div>
          ))}
        </div></div>
      </div>
    </div>
  );
}
