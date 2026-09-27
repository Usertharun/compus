import AppRouter from "./routes/AppRouter";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

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

function App() { return <AuthProvider><SessionApp /></AuthProvider>; }
