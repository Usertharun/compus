import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "@/components/layout";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
const Campus = lazy(() => import("@/pages/Campus"));
const Discover = lazy(() => import("@/pages/Discover"));
const Communities = lazy(() => import("@/pages/Communities"));
const Messages = lazy(() => import("@/pages/Messages"));
const Profile = lazy(() => import("@/pages/Profile"));
const Events = lazy(() => import("@/pages/Events"));
const Opportunities = lazy(() => import("@/pages/Opportunities"));
const Saved = lazy(() => import("@/pages/Saved"));
const Admin = lazy(() => import("@/pages/Admin"));
const Settings = lazy(() => import("@/pages/Settings"));
import { useAuth } from "@/context/AuthContext";
import PasswordRecovery from "@/pages/PasswordRecovery";
import { Outlet } from "react-router-dom";

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
  if (status === "loading")
    return (
      <div
        role="status"
        className="min-h-screen flex items-center justify-center bg-background text-foreground"
      >
        Checking your session…
      </div>
    );
  if (status === "error")
    return (
      <main className="min-h-screen flex flex-col gap-4 items-center justify-center bg-background text-foreground p-6">
        <p role="alert">{error}</p>
        <button className="text-primary" onClick={() => void restore()}>
          Try again
        </button>
        <button onClick={() => void logout().catch(() => undefined)}>
          Sign out on this device
        </button>
      </main>
    );

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div role="status" className="p-8 text-center text-muted-foreground">
            Loading page…
          </div>
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/owner-login" element={<Login owner />} />
          <Route path="/forgot-password" element={<PasswordRecovery />} />
          <Route path="/reset-password" element={<PasswordRecovery reset />} />
          <Route element={<OnboardingGuard />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

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
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback redirect */}
          <Route
            path="*"
            element={<Navigate to={user ? "/campus" : "/login"} replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
