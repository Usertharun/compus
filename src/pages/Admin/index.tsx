import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/services/models";
import AccountAdministration from '@/components/admin/AccountAdministration';
import ProductAnalyticsPanel, { type ProductAnalytics } from '@/components/admin/ProductAnalyticsPanel';
interface Feedback {
  id: string;
  category: string;
  message: string;
  page: string;
  createdAt: string;
  user: { email: string; profile?: { name: string } };
}
interface Report {
  id: string;
  reason: string;
  status: string;
  details?: string;
  post: { content: string; deletedAt?: string };
  reporter?: { email: string };
}
interface AdminAnalyticsResponse {
  product: ProductAnalytics;
}
export default function AdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [f, r, a] = await Promise.all([
        apiRequest<Feedback[]>("/feedback"),
        apiRequest<Report[]>("/admin/reports"),
        apiRequest<AdminAnalyticsResponse>("/admin/analytics"),
      ]);
      setFeedback(f);
      setReports(r);
      setAnalytics(a.product);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load owner tools.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let stopped = false;
    if (user?.role === 'SUPER_ADMIN') void Promise.all([apiRequest<Feedback[]>('/feedback'), apiRequest<Report[]>('/admin/reports'), apiRequest<AdminAnalyticsResponse>('/admin/analytics')])
      .then(([f, r, a]) => { if (!stopped) { setFeedback(f); setReports(r); setAnalytics(a.product); } })
      .catch(e => { if (!stopped) setError(e instanceof Error ? e.message : 'Unable to load owner tools.'); })
      .finally(() => { if (!stopped) setLoading(false); });
    return () => { stopped = true; };
  }, [user?.role]);
  if (user?.role !== "SUPER_ADMIN") return <Navigate to="/campus" replace />;
  return (
    <div className="space-y-6 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold">Owner tools</h1>
          <p className="text-sm text-muted-foreground">
            Review tester feedback and keep campus content safe.
          </p>
        </div>
        <button
          disabled={loading}
          onClick={() => void load()}
          className="rounded-xl bg-primary text-primary-foreground px-4 py-2"
        >
          Refresh
        </button>
      </header>
      {loading && <p role="status">Loading owner tools…</p>}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {analytics && <ProductAnalyticsPanel analytics={analytics} />}
      <AccountAdministration />
      <section className="space-y-3">
        <h2 className="font-bold">
          Content reports (
          {reports.filter((r) => r.status === "PENDING").length} pending)
        </h2>
        {!loading && !reports.length && (
          <p className="text-sm text-muted-foreground">
            No content reports yet.
          </p>
        )}
        {reports.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-border bg-card p-5 space-y-3"
          >
            <p className="text-sm font-semibold">
              {r.reason} · {r.status}
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {r.post?.content || "Post unavailable"}
            </p>
            {r.details && (
              <p className="text-sm text-muted-foreground">{r.details}</p>
            )}
            {r.status === "PENDING" && (
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    label: "Dismiss report",
                    status: "DISMISSED",
                    deleteContent: false,
                  },
                  {
                    label: "Remove post",
                    status: "REVIEWED",
                    deleteContent: true,
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    disabled={busy === r.id}
                    className={
                      "text-sm underline " +
                      (action.deleteContent
                        ? "text-destructive"
                        : "text-primary")
                    }
                    onClick={async () => {
                      if (
                        action.deleteContent &&
                        !window.confirm(
                          "Remove this reported post from campus?",
                        )
                      )
                        return;
                      setBusy(r.id);
                      try {
                        await apiRequest(
                          "/admin/reports/" + r.id + "/resolve",
                          "PATCH",
                          {
                            status: action.status,
                            deleteContent: action.deleteContent,
                          },
                        );
                        await load();
                        toast.success("Report resolved.");
                      } catch (e) {
                        toast.error(
                          e instanceof Error
                            ? e.message
                            : "Unable to resolve report.",
                        );
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="font-bold">Latest tester feedback</h2>
        {!loading && !feedback.length && (
          <p className="text-sm text-muted-foreground">
            Feedback submitted in Compus will appear here.
          </p>
        )}
        {feedback.map((f) => (
          <article
            key={f.id}
            className="rounded-2xl border border-border bg-card p-5 space-y-2"
          >
            <p className="font-semibold text-sm">
              {f.category} · {f.user.profile?.name || "Student"}
            </p>
            <p className="text-xs text-muted-foreground">
              {f.user.email} · {f.page} · {formatDate(f.createdAt)}
            </p>
            <p className="text-sm whitespace-pre-wrap">{f.message}</p>
          </article>
        ))}
        <p className="text-xs text-muted-foreground">
          Showing the latest 100 feedback submissions and 50 reports.
        </p>
      </section>
    </div>
  );
}
