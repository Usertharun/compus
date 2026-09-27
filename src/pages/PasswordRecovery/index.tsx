import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '@/services/api';

export default function PasswordRecovery({ reset = false }: { reset?: boolean }) {
  const [params] = useSearchParams();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const token = params.get('token') || '';
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!reset && !/^[a-z0-9._%+-]+@srmist\.edu\.in$/i.test(value.trim())) { setError('Use your SRM email address ending in @srmist.edu.in.'); return; }
    setBusy(true); setError('');
    try {
      const result = reset ? await apiService.resetPassword(token, value) : await apiService.forgotPassword(value.trim());
      setNotice(result.message); setValue('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-4"><section className="glass-panel rounded-3xl p-8 max-w-md w-full space-y-5">
    <h1 className="text-2xl font-bold">{reset ? 'Set a new password' : 'Reset your password'}</h1>
    <p className="text-sm text-muted-foreground">{reset ? 'Use at least 8 characters, including uppercase, lowercase, a number and a symbol.' : 'Enter your @srmist.edu.in email to request a reset link.'}</p>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {notice ? <p role="status">{notice}</p> : reset && !token ? <p role="alert">This reset link is missing its token. Request a new link.</p> : <form onSubmit={submit} className="space-y-4">
      <label htmlFor="recovery-input" className="block">{reset ? 'New password' : 'SRM email'}</label>
      <input id="recovery-input" type={reset ? 'password' : 'email'} autoComplete={reset ? 'new-password' : 'email'} required minLength={reset ? 8 : undefined} pattern={reset ? '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}' : undefined} value={value} onChange={e => setValue(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background"/>
      <button disabled={busy} className="w-full bg-primary text-primary-foreground rounded-xl p-3 disabled:opacity-60">{busy ? 'Please wait…' : reset ? 'Save new password' : 'Send reset link'}</button>
    </form>}
    <Link to="/login" className="block text-primary">Back to sign in</Link>
    {reset && <Link to="/forgot-password" className="block text-primary">Request a new reset link</Link>}
  </section></main>;
}
