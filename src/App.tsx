import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { apiRequest } from './services/api';

function SessionApp() {
  const { user } = useAuth();
  useEffect(() => {
    if (user) void apiRequest('/analytics/session', 'POST').catch(() => undefined);
  }, [user]);
  return (
    <AppProvider key={user ? user.id + ':' + user.onboardingCompleted : 'anonymous'}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;

function App() { return <AppErrorBoundary><AuthProvider><SessionApp /></AuthProvider></AppErrorBoundary>; }
