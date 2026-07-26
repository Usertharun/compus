import { ReactNode } from "react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string; // Lucide icon name or React component
  badge?: number | string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  campusName: string;
  majorYear?: string;
  statusText?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "event" | "community" | "message" | "system";
  avatar?: string;
}

export interface AppLayoutProps {
  children?: ReactNode;
  /** Optional custom title override for TopAppBar */
  pageTitle?: string;
  /** Optional custom subtitle override */
  pageSubtitle?: string;
  /** Hide top app bar if needed */
  hideTopBar?: boolean;
  /** Hide bottom navigation if needed */
  hideBottomNav?: boolean;
  /** Max container width class (defaults to max-w-7xl) */
  maxWidthClass?: string;
}
