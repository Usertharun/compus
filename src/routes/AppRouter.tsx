import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "@/components/layout";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Campus from "@/pages/Campus";
import Discover from "@/pages/Discover";
import Communities from "@/pages/Communities";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import Events from "@/pages/Events";
import Opportunities from "@/pages/Opportunities";
import Saved from "@/pages/Saved";
import Settings from "@/pages/Settings";
import { useAuth } from '@/context/AuthContext';
import PasswordRecovery from '@/pages/PasswordRecovery';
import { Outlet } from 'react-router-dom';

function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <AppLayout />;
}

function OnboardingGuard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingCompleted) return <Navigate to="/campus" replace />;
  return <Outlet />;
}

export default function AppRouter() {
  const { user, status, error, restore, logout } = useAuth();
  if (status === 'loading') return <div role="status" className="min-h-screen flex items-center justify-center bg-background text-foreground">Checking your session…</div>;
  if (status === 'error') return <main className="min-h-screen flex flex-col gap-4 items-center justify-center bg-background text-foreground p-6"><p role="alert">{error}</p><button className="text-primary" onClick={() => void restore()}>Try again</button><button onClick={() => void logout().catch(() => undefined)}>Sign out on this device</button></main>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<PasswordRecovery />} />
        <Route path="/reset-password" element={<PasswordRecovery reset />} />
        <Route element={<OnboardingGuard />}><Route path="/onboarding" element={<Onboarding />} /></Route>

        {/* Authenticated App Layout Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Campus />} />
          <Route path="/campus" element={<Campus />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/events" element={<Events />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to={user ? "/campus" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
