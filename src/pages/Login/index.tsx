import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function Login({ owner = false }: { owner?: boolean }) {
  const { user, acceptSession } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  if (user) return <Navigate to={user.role === 'SUPER_ADMIN' ? '/admin' : user.onboardingCompleted ? '/campus' : '/onboarding'} replace />;

  async function sendCode() {
    await apiService.requestOtp(email.trim().toLowerCase());
    setVerifying(true); setOtp(''); setNotice('Check your email inbox for a six-digit code. It expires in 10 minutes.');
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!owner && !/^[a-z0-9._%+-]+@srmist\.edu\.in$/i.test(email.trim())) { setError('Use your SRM email address ending in @srmist.edu.in.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'signup' && !verifying) await sendCode();
      else {
        const response = mode === 'login'
          ? await apiService.login(email.trim().toLowerCase(), password)
          : await apiService.registerWithOtp(email.trim().toLowerCase(), password, otp, name.trim());
        await acceptSession(response);
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  }
  async function resend() {
    setBusy(true); setError(''); setNotice('');
    try { await sendCode(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to resend your code.'); }
    finally { setBusy(false); }
  }
  const inputClass = 'w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';
  return <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6">
    <section className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-md space-y-6" aria-labelledby="login-title">
      <div className="text-center space-y-2">
        <Sparkles className="w-12 h-12 p-2 rounded-2xl bg-primary text-primary-foreground mx-auto" />
        <h1 id="login-title" className="text-3xl font-extrabold">COMPUS</h1>
        <p className="text-sm text-muted-foreground">{owner ? "Compus owner access" : "Your digital campus ecosystem"}</p>
      </div>
      {!verifying && <div className="flex rounded-2xl bg-secondary/40 p-1">
        {(['login', 'signup'] as const).map(value => <button key={value} disabled={busy} onClick={() => { setMode(value); setError(''); setNotice(''); }} aria-pressed={mode === value} className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${mode === value ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>{value === 'login' ? 'Sign In' : 'Create Account'}</button>)}
      </div>}
      <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
        {error && <p role="alert" className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</p>}
        {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
        {verifying ? <>
          <h2 className="font-bold text-lg">Verify your email</h2>
          <p className="text-sm text-muted-foreground">Enter the code sent to {email}.</p>
          <label htmlFor="otp" className="block text-sm font-medium">Verification code</label>
          <input id="otp" className={`${inputClass} text-center tracking-widest`} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus />
        </> : <>
          {mode === 'signup' && <div className="space-y-1.5"><label htmlFor="full-name" className="text-sm font-medium">Full name</label><input id="full-name" autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} className={inputClass} /></div>}
          <div className="space-y-1.5"><label htmlFor="email" className="text-sm font-medium">{owner ? "Administrator email" : "SRM email"}</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={owner ? "Your designated administrator email" : "you@srmist.edu.in"} className={inputClass} /></div>
          <div className="space-y-1.5">
            <div className="flex justify-between"><label htmlFor="password" className="text-sm font-medium">Password</label>{mode === 'login' && <Link to={owner ? "/forgot-password?owner=1" : "/forgot-password"} className="text-sm text-primary">Forgot password?</Link>}</div>
            <div className="relative"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'signup' ? 8 : undefined} pattern={mode === 'signup' ? '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}' : undefined} value={password} onChange={e => setPassword(e.target.value)} className={`${inputClass} pr-12`} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button></div>
            {mode === 'signup' && <p className="text-xs text-muted-foreground">Use at least 8 characters, with uppercase, lowercase, a number and a symbol.</p>}
          </div>
        </>}
        <button disabled={busy} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-60">{busy ? <><LoaderCircle className="animate-spin" size={18}/>Please wait…</> : <>{verifying ? 'Verify & create account' : mode === 'login' ? (owner ? 'Sign in as owner' : 'Sign In to Campus') : 'Send verification code'}<ArrowRight size={18}/></>}</button>
        {verifying && <div className="flex justify-between text-sm"><button type="button" disabled={busy} onClick={() => { setVerifying(false); setOtp(''); setError(''); setNotice(''); }}>Change details</button><button type="button" disabled={busy} onClick={resend} className="text-primary">Resend code</button></div>}
      </form>
      <p className="text-xs text-muted-foreground text-center">{owner ? "Owner registration requires verification of the designated administrator email." : "Student access is limited to @srmist.edu.in email addresses."}</p>
    </section>
  </main>;
}
