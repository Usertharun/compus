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

function ProtectedLayout() {
  const isAuthenticated = localStorage.getItem("compus_auth") === "true";
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
}

export default function AppRouter() {
  const isAuthenticated = localStorage.getItem("compus_auth") === "true";

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

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
        <Route path="*" element={<Navigate to={isAuthenticated ? "/campus" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}