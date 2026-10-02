import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';
import type { Page } from '@/services/models';
import type { CampusEvent } from '@/data/eventsData';
import { useToast } from '@/context/ToastContext';
import { useDialogAccessibility } from '@/hooks/useDialogAccessibility';

interface Attendee { userId: string; status: string; checkedIn: boolean; user: { profile?: { name: string } } }
const localTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function EventManager({ event, onClose, onSaved }: { event: CampusEvent; onClose: () => void; onSaved: () => Promise<void> }) {
  const toast = useToast();
  const [draft, setDraft] = useState({ title: event.title, description: event.description || '', venue: event.venue, category: event.category || '', startTime: localTime(event.startTime), endTime: localTime(event.endTime) });
  const [attendees, setAttendees] = useState<Page<Attendee>>({ items: [] });
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextStatus, setNextStatus] = useState('');
  const availableStatuses: Record<string, string[]> = { DRAFT: ['PUBLISHED', 'REGISTRATION_OPEN'], PUBLISHED: ['REGISTRATION_OPEN'], REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'ONGOING'], REGISTRATION_CLOSED: ['REGISTRATION_OPEN', 'ONGOING'], ONGOING: ['COMPLETED'] };
  useDialogAccessibility(true, onClose);
  const load = useCallback(async () => {
    return apiRequest<Page<Attendee>>(`/events/${event.id}/attendees?page=${page}&limit=20`);
  }, [event.id, page]);
  useEffect(() => {
    let stopped = false;
    void load().then(result => { if (!stopped) { setAttendees(result); setError(''); } }).catch(e => { if (!stopped) setError(e instanceof Error ? e.message : 'Unable to load attendees'); }).finally(() => { if (!stopped) setLoading(false); });
    return () => { stopped = true; };
  }, [load]);
  const act = async (operation: () => Promise<unknown>, message: string) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await operation(); await onSaved(); setAttendees(await load()); toast.success(message); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to update event'); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="event-manager-title" className="bg-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5">
      <div className="flex justify-between"><h2 id="event-manager-title" className="text-xl font-bold">Manage {event.title}</h2><button onClick={onClose} aria-label="Close event management">Close</button></div>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); void act(() => apiRequest(`/events/${event.id}`, 'PATCH', { ...draft, startTime: new Date(draft.startTime).toISOString(), endTime: new Date(draft.endTime).toISOString() }), 'Event updated'); }}>
        {(Object.keys(draft) as (keyof typeof draft)[]).map(field => <label key={field} className="block text-sm capitalize">{field === 'startTime' ? 'Start time' : field === 'endTime' ? 'End time' : field}
          <input required maxLength={field === 'description' ? 10000 : 200} type={field.endsWith('Time') ? 'datetime-local' : 'text'} value={draft[field]} onChange={e => setDraft(prev => ({ ...prev, [field]: e.target.value }))} className="block w-full border rounded-xl p-2 bg-background" />
        </label>)}
        <button disabled={busy || event.status === 'CANCELLED'} className="bg-primary text-primary-foreground rounded-xl px-4 py-2">Save event</button>
      </form>
      <form className="flex gap-3" onSubmit={e => { e.preventDefault(); void act(() => apiRequest(`/events/${event.id}/status`, 'POST', { status: nextStatus }), 'Event status updated'); }}>
        <label className="text-sm">Event status<select required aria-label="New event status" value={nextStatus} onChange={e => setNextStatus(e.target.value)} className="block border rounded-xl p-2 bg-background"><option value="">Current: {event.status}</option>{(availableStatuses[event.status || ''] || []).map(status => <option key={status} value={status}>{status.replaceAll('_', ' ').toLowerCase()}</option>)}</select></label>
        <button disabled={busy || event.status === 'CANCELLED' || event.status === 'COMPLETED'} className="border rounded-xl px-3">Update status</button>
      </form>
      <button disabled={busy || event.status === 'CANCELLED' || event.status === 'COMPLETED'} className="text-destructive underline" onClick={() => { if (window.confirm('Cancel this event? Registered students will be notified.')) void act(() => apiRequest(`/events/${event.id}/status`, 'POST', { status: 'CANCELLED', reason: 'Cancelled by organizer' }), 'Event cancelled'); }}>Cancel event</button>
      <h3 className="font-bold">Attendance ({attendees.total ?? 0} registrations)</h3>
      {loading && <p role="status">Loading attendees…</p>}
      {!loading && !attendees.items.length && <p>No registrations yet.</p>}
      {attendees.items.map(a => <div key={a.userId} className="flex items-center justify-between border rounded-xl p-3 gap-3">
        <span>{a.user.profile?.name || 'Student'} · {a.status}</span>
        <label className="flex gap-2"><input type="checkbox" checked={a.checkedIn} disabled={busy || a.status !== 'GOING' || event.status === 'CANCELLED'} onChange={e => { const checkedIn = e.target.checked; void act(() => apiRequest(`/events/${event.id}/attendees/${a.userId}`, 'PATCH', { checkedIn }), 'Attendance updated'); }} />Checked in</label>
      </div>)}
      <nav aria-label="Attendee pages" className="flex gap-4"><button disabled={busy || page === 1} onClick={() => { setLoading(true); setPage(p => p - 1); }}>Previous</button><span>Page {page} of {attendees.totalPages || 1}</span><button disabled={busy || page >= (attendees.totalPages || 1)} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Next</button></nav>
    </section>
  </div>;
}
