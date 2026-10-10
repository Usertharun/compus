import { Activity, CalendarCheck, Target, UserCheck, Users } from 'lucide-react';

export interface ProductAnalytics {
  generatedAt: string;
  dataSince: string | null;
  audience: {
    totalStudents: number;
    onboardedStudents: number;
    onboardingRate: number;
    newStudents7d: number;
    newStudents30d: number;
  };
  activity: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    stickiness: number;
  };
  activation: {
    registered: number;
    onboarded: number;
    activated: number;
    onboardingConversion: number;
    activationConversion: number;
  };
  actions: { eventType: string; users: number; events: number }[];
  retention: {
    day7: RetentionMetric;
    day28: RetentionMetric;
  };
  trend: { date: string; activeUsers: number; registrations: number }[];
}

interface RetentionMetric {
  rate: number | null;
  eligibleUsers: number;
  retainedUsers: number;
  status: string;
}

const labels: Record<string, string> = {
  COMMUNITY_JOINED: 'Joined communities',
  COMMUNITY_JOIN_REQUESTED: 'Requested club access',
  EVENT_REGISTERED: 'Registered for events',
  OPPORTUNITY_SAVED: 'Saved opportunities',
  OPPORTUNITY_APPLIED: 'Applied to opportunities',
  STUDENT_FOLLOWED: 'Connected with students',
  POST_CREATED: 'Created posts',
  MESSAGE_SENT: 'Sent messages',
};

function MetricCard({ label, value, note, icon: Icon }: { label: string; value: string | number; note: string; icon: typeof Users }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </article>
  );
}

function retentionText(metric: RetentionMetric) {
  return metric.rate === null ? 'Collecting data' : `${metric.rate}%`;
}

export default function ProductAnalyticsPanel({ analytics }: { analytics: ProductAnalytics }) {
  const maxTrend = Math.max(1, ...analytics.trend.map((day) => day.activeUsers));
  const meaningfulActions = analytics.actions.filter((action) => action.events > 0);
  return (
    <section className="space-y-4" aria-labelledby="product-health-heading">
      <div>
        <h2 id="product-health-heading" className="text-lg font-bold">Product health</h2>
        <p className="text-sm text-muted-foreground">
          Student activation and retention from completed actions. {analytics.dataSince ? `Tracking since ${new Date(analytics.dataSince).toLocaleDateString()}.` : 'Tracking begins with the next student session.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard label="Students" value={analytics.audience.totalStudents} note={`${analytics.audience.newStudents7d} joined this week`} icon={Users} />
        <MetricCard label="Onboarded" value={`${analytics.audience.onboardingRate}%`} note={`${analytics.audience.onboardedStudents} profiles completed`} icon={UserCheck} />
        <MetricCard label="Daily active" value={analytics.activity.dailyActiveUsers} note={`${analytics.activity.weeklyActiveUsers} active this week`} icon={Activity} />
        <MetricCard label="Activation" value={`${analytics.activation.activationConversion}%`} note={`${analytics.activation.activated} reached a valuable action`} icon={Target} />
        <MetricCard label="Day 7 retention" value={retentionText(analytics.retention.day7)} note={analytics.retention.day7.status === 'COLLECTING' ? 'Available after seven days' : `${analytics.retention.day7.retainedUsers} of ${analytics.retention.day7.eligibleUsers} returned`} icon={CalendarCheck} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">Active students · last 14 days</h3>
          <div className="mt-4 flex h-32 items-end gap-1" aria-label="Daily active student chart">
            {analytics.trend.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col justify-end items-center gap-1" title={`${day.date}: ${day.activeUsers} active, ${day.registrations} registrations`}>
                <span className="text-[10px] text-muted-foreground">{day.activeUsers || ''}</span>
                <div className="w-full min-h-1 rounded-t bg-primary/80" style={{ height: `${Math.max(4, (day.activeUsers / maxTrend) * 88)}px` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>{analytics.trend[0]?.date.slice(5)}</span><span>{analytics.trend.at(-1)?.date.slice(5)}</span></div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold">Meaningful actions · last 14 days</h3>
          {!meaningfulActions.length && <p className="text-sm text-muted-foreground mt-4">Actions will appear as students use Compus.</p>}
          <div className="mt-3 space-y-3">
            {meaningfulActions.map((action) => (
              <div key={action.eventType} className="flex items-center justify-between gap-3 text-sm">
                <span>{labels[action.eventType] || action.eventType}</span>
                <span className="font-semibold whitespace-nowrap">{action.users} students · {action.events} actions</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
