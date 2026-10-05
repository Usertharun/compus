import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "@/services/api";
import { cn } from "@/lib/utils";

interface HubNotification {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  category: string;
  priority: string;
  createdAt: string;
}

interface HubOpportunity {
  id: string;
  title: string;
  companyName: string;
  deadline?: string | null;
}

interface CampusHubData {
  generatedAt: string;
  firstName: string;
  unreadCount: number;
  notifications: HubNotification[];
  upcomingEvents: Array<{
    id: string;
    title: string;
    venue: string;
    startTime: string;
    endTime: string;
    registrationStatus: string;
  }>;
  applications: Array<{
    id: string;
    status: string;
    appliedAt: string;
    opportunity: HubOpportunity;
  }>;
  savedOpportunities: Array<{
    id: string;
    createdAt: string;
    opportunity: HubOpportunity | null;
  }>;
}

function when(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export function MyCampusHub() {
  const navigate = useNavigate();
  const [data, setData] = useState<CampusHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await apiRequest<CampusHubData>("/users/me/hub"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your campus summary could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the authenticated summary when this independently mounted view opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (loading && !data) {
    return <div role="status" className="rounded-3xl border border-border/60 bg-card/60 p-8 text-sm text-muted-foreground">Preparing your campus day…</div>;
  }

  if (error && !data) {
    return <div role="alert" className="rounded-3xl border border-destructive/30 bg-destructive/10 p-5"><p className="text-sm">{error}</p><button onClick={() => void load()} className="mt-3 inline-flex items-center gap-2 font-semibold text-primary"><RefreshCw className="h-4 w-4" />Try again</button></div>;
  }

  if (!data) return null;

  const actions = [
    ...data.notifications.slice(0, 3).map((item) => ({
      id: `notification-${item.id}`,
      icon: Bell,
      tone: "primary",
      title: item.title,
      detail: item.body,
      meta: when(item.createdAt),
      label: item.link ? "Open" : "View notifications",
      path: item.link || "/settings",
    })),
    ...data.upcomingEvents.slice(0, 2).map((event) => ({
      id: `event-${event.id}`,
      icon: CalendarClock,
      tone: "amber",
      title: event.title,
      detail: `${event.venue} · ${event.registrationStatus === "WAITLISTED" ? "Waitlisted" : "Registered"}`,
      meta: when(event.startTime),
      label: "View event",
      path: "/events",
    })),
    ...data.applications.slice(0, 2).map((application) => ({
      id: `application-${application.id}`,
      icon: BriefcaseBusiness,
      tone: "emerald",
      title: application.opportunity.title,
      detail: `${application.opportunity.companyName} · ${application.status.toLowerCase()}`,
      meta: application.opportunity.deadline ? `Deadline ${when(application.opportunity.deadline)}` : "Application submitted",
      label: "Track application",
      path: "/opportunities",
    })),
  ].slice(0, 6);

  return (
    <section className="space-y-5" aria-labelledby="campus-hub-heading">
      <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-card/70 to-primary/10 p-5 sm:p-6 shadow-sm">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Your campus today</p>
          <h1 id="campus-hub-heading" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {data.firstName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Messages, events, applications and deadlines that need your attention.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Unread", value: data.unreadCount, icon: Inbox, path: "/settings" },
          { label: "Upcoming", value: data.upcomingEvents.length, icon: CalendarClock, path: "/events" },
          { label: "Applications", value: data.applications.length, icon: BriefcaseBusiness, path: "/opportunities" },
          { label: "Saved", value: data.savedOpportunities.length, icon: Bookmark, path: "/saved" },
        ].map(({ label, value, icon: Icon, path }) => (
          <button key={label} onClick={() => navigate(path)} className="rounded-2xl border border-border/60 bg-card/70 p-4 text-left transition-colors hover:bg-secondary/60">
            <Icon className="mb-3 h-4 w-4 text-primary" />
            <strong className="block text-xl font-black tabular-nums">{value}</strong>
            <span className="text-xs text-muted-foreground">{label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/60 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="font-bold">What needs your attention</h2><p className="text-xs text-muted-foreground">Complete important campus actions from one place.</p></div>
          <button onClick={() => void load()} disabled={loading} aria-label="Refresh campus summary" className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></button>
        </div>
        {actions.length ? <div className="space-y-2.5">{actions.map(({ id, icon: Icon, tone, title, detail, meta, label, path }) => (
          <article key={id} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border/50 bg-background/50 p-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto]">
            <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tone === "amber" ? "bg-amber-500/10 text-amber-500" : tone === "emerald" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}><Icon className="h-4 w-4" /></span>
            <div className="min-w-0"><h3 className="truncate text-sm font-semibold">{title}</h3><p className="truncate text-xs text-muted-foreground">{detail}</p><p className="mt-1 text-[11px] font-medium text-muted-foreground">{meta}</p></div>
            <button onClick={() => navigate(path)} className="col-start-2 justify-self-start rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground sm:col-start-3 sm:row-start-1 sm:justify-self-auto">{label}</button>
          </article>
        ))}</div> : <div className="py-8 text-center"><CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-500" /><p className="font-semibold">You are caught up</p><p className="text-sm text-muted-foreground">New campus actions will appear here.</p></div>}
      </div>
    </section>
  );
}
