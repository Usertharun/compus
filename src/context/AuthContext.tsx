import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiService, ApiError, sessionStore, type AuthResponse, type AuthUser } from '@/services/api';

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'anonymous' | 'error';
  error: string;
  restore: () => Promise<void>;
  acceptSession: (response: AuthResponse) => Promise<void>;
  completeOnboarding: (data: { name: string; department: string; year: string; goals: string[] }) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const [error, setError] = useState('');
  const restore = useCallback(async () => {
    if (!sessionStore.read()) { setUser(null); setStatus('anonymous'); return; }
    setStatus('loading'); setError('');
    try {
      const account = await apiService.getMe();
      if (!sessionStore.read()) return;
      setUser(account); setStatus('authenticated');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        sessionStore.clear(); setUser(null); setStatus('anonymous');
      } else {
        setError(err instanceof Error ? err.message : 'Unable to check your session.'); setStatus('error');
      }
    }
  }, []);
  useEffect(() => {
    const ended = () => { setUser(null); setStatus('anonymous'); };
    window.addEventListener('compus:session-ended', ended);
    // Restore is the initial synchronization with the external session service.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restore();
    return () => window.removeEventListener('compus:session-ended', ended);
  }, [restore]);
  async function acceptSession(response: AuthResponse) {
    if (!response.accessToken || !response.refreshToken || !response.user?.id) throw new Error('The server returned an invalid session.');
    sessionStore.write(response);
    try {
      const account = await apiService.getMe();
      setUser(account); setStatus('authenticated'); setError('');
    } catch (err) { sessionStore.clear(); throw err; }
  }
  async function logout() {
    try { if (sessionStore.read()) await apiService.logout(); }
    finally { sessionStore.clear(); setUser(null); setStatus('anonymous'); }
  }
  async function completeOnboarding(data: { name: string; department: string; year: string; goals: string[] }) {
    setUser(await apiService.completeOnboarding(data));
  }
  return <AuthContext.Provider value={{ user, status, error, restore, acceptSession, logout, completeOnboarding }}>{children}</AuthContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth requires AuthProvider');
  return value;
}
