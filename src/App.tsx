import AppRouter from "./routes/AppRouter";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

function SessionApp() {
  const { user } = useAuth();
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
