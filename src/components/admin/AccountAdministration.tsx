import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';
import type { Page } from '@/services/models';

interface Account { id: string; email: string; role: string; isActive: boolean; isVerified: boolean; createdAt: string; profile?: { name: string; department?: string; year?: string } }
interface ClubLogin { id: string; email: string; community: { name: string } }
interface Club { id: string; name: string; login?: { email: string } | null }
export default function AccountAdministration() {
  const [accounts, setAccounts] = useState<Page<Account>>({ items: [] });
  const [clubs, setClubs] = useState<ClubLogin[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState({ search: '', isActive: '', role: '' });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [clubEmail, setClubEmail] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [clubQuery, setClubQuery] = useState('');
  const [clubPage, setClubPage] = useState(1);
  const [clubOptions, setClubOptions] = useState<Page<Club>>({ items: [] });
  useEffect(() => {
    let stopped = false;
    const timer = window.setTimeout(() => {
      void apiRequest<Page<Club>>('/admin/communities?' + new URLSearchParams({ search: clubQuery, page: String(clubPage), limit: '20' }))
        .then(result => { if (!stopped) setClubOptions(result); })
        .catch(e => { if (!stopped) setError(e instanceof Error ? e.message : 'Unable to load communities'); });
    }, 200);
    return () => { stopped = true; window.clearTimeout(timer); };
  }, [clubQuery, clubPage]);
  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: '20', search: filter.search });
    if (filter.isActive) params.set('isActive', filter.isActive);
    if (filter.role) params.set('role', filter.role);
    return Promise.all([apiRequest<Page<Account>>('/admin/users?' + params), apiRequest<ClubLogin[]>('/admin/community-logins')]);
  }, [page, filter]);
  useEffect(() => {
    let stopped = false;
    void load().then(([users, logins]) => { if (!stopped) { setAccounts(users); setClubs(logins); setError(''); } }).catch(e => { if (!stopped) setError(e instanceof Error ? e.message : 'Unable to load accounts'); });
    return () => { stopped = true; };
  }, [load]);
  const act = async (operation: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await operation(); const [users, logins] = await load(); setAccounts(users); setClubs(logins); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to update account'); }
    finally { setBusy(false); }
  };
  return <section className="space-y-4">
    <h2 className="font-bold text-xl">Student and community accounts</h2>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); setPage(1); setFilter(prev => ({ ...prev, search: query })); }}>
      <input aria-label="Search accounts" placeholder="Name or email" value={query} onChange={e => setQuery(e.target.value)} className="border rounded-xl p-2 bg-background" />
      <select aria-label="Account status" value={filter.isActive} onChange={e => { setPage(1); setFilter(prev => ({ ...prev, isActive: e.target.value })); }} className="border rounded-xl p-2 bg-background"><option value="">All statuses</option><option value="true">Active</option><option value="false">Suspended</option></select>
      <select aria-label="Account type" value={filter.role} onChange={e => { setPage(1); setFilter(prev => ({ ...prev, role: e.target.value })); }} className="border rounded-xl p-2 bg-background"><option value="">All types</option><option value="VERIFIED_USER">Students</option><option value="COMMUNITY_ACCOUNT">Communities</option></select>
      <button className="border rounded-xl px-4">Search</button>
    </form>
    <p className="text-sm">{accounts.total ?? 0} accounts</p>
    {accounts.items.map(a => <article key={a.id} className="border rounded-2xl p-4 space-y-2">
      <p className="font-semibold">{a.profile?.name || a.email}</p><p className="text-sm text-muted-foreground">{a.email} · {a.role} · {a.isActive ? 'Active' : 'Suspended'} · {a.isVerified ? 'Verified' : 'Unverified'}</p>
      <p className="text-sm">{a.profile?.department} {a.profile?.year}</p>
      {a.role !== 'SUPER_ADMIN' && <div className="flex flex-wrap gap-4 text-sm">
        <button disabled={busy} className="underline" onClick={() => {
          const reason = a.isActive ? window.prompt('Reason for suspension:') : undefined;
          if (a.isActive && !reason?.trim()) return;
          void act(() => apiRequest(`/admin/users/${a.id}/${a.isActive ? 'suspend' : 'reactivate'}`, 'POST', a.isActive ? { reason } : {}));
        }}>{a.isActive ? 'Suspend' : 'Reactivate'}</button>
        <button disabled={busy} className="underline" onClick={() => { if (window.confirm(`Sign ${a.email} out on every device?`)) void act(() => apiRequest(`/admin/users/${a.id}/revoke-sessions`, 'POST', {})); }}>Revoke all sessions</button>
        <button disabled={busy} className="underline text-destructive" onClick={() => { if (window.confirm(`Delete ${a.email}'s account? Transfer any owned communities first.`)) void act(() => apiRequest(`/admin/users/${a.id}`, 'DELETE')); }}>Delete account</button>
      </div>}
    </article>)}
    <nav aria-label="Account pages" className="flex gap-4"><button disabled={busy || page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {accounts.totalPages || 1}</span><button disabled={busy || page >= (accounts.totalPages || 1)} onClick={() => setPage(p => p + 1)}>Next</button></nav>
    <h3 className="font-bold">Approve a permanent community login</h3>
    <p className="text-sm text-muted-foreground">Use a mailbox the club controls. After approval, its team can verify the email at Community login. Activation transfers community ownership to this permanent account. Each year, change its password and revoke all sessions before handing it over.</p>
    <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); void act(() => apiRequest('/admin/community-logins', 'POST', { email: clubEmail, communityId })); }}>
      <input aria-label="Permanent club email" type="email" required value={clubEmail} onChange={e => setClubEmail(e.target.value)} placeholder="clubname@gmail.com" className="border rounded-xl p-2 bg-background" />
      <input aria-label="Find community" value={clubQuery} onChange={e => { setClubQuery(e.target.value); setClubPage(1); setCommunityId(''); }} placeholder="Find club by name" className="border rounded-xl p-2 bg-background" />
      <select aria-label="Community" required value={communityId} onChange={e => setCommunityId(e.target.value)} className="border rounded-xl p-2 bg-background"><option value="">Choose a community</option>{clubOptions.items.map(c => <option key={c.id} value={c.id} disabled={!!c.login}>{c.name}{c.login ? ' (login already approved)' : ''}</option>)}</select>
      <button disabled={busy} className="bg-primary text-primary-foreground rounded-xl px-4 py-2">Approve login</button>
    </form>
    <nav aria-label="Community options" className="flex gap-4 text-sm"><button disabled={clubPage === 1} onClick={() => { setClubPage(p => p - 1); setCommunityId(''); }}>Previous clubs</button><span>{clubPage} / {clubOptions.totalPages || 1}</span><button disabled={clubPage >= (clubOptions.totalPages || 1)} onClick={() => { setClubPage(p => p + 1); setCommunityId(''); }}>Next clubs</button></nav>
    {clubs.map(c => <p key={c.id} className="text-sm">{c.community.name} · {c.email}</p>)}
  </section>;
}
