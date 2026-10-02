import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useEffect, useState } from "react";
import { apiRequest } from "@/services/api";
import { useToast } from "@/context/ToastContext";
interface Application {
  id: string;
  status: string;
  coverLetter?: string;
  resumeUrl?: string;
  user: { email: string; profile?: { name: string; department?: string } };
}
export function ApplicantsPanel({
  opportunityId,
  onClose,
}: {
  opportunityId: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setItems(
        await apiRequest<Application[]>(
          "/opportunities/" + opportunityId + "/applications",
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load applicants.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [opportunityId]);
  useDialogAccessibility(true, onClose);
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 p-4 flex items-center justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Applications received"
        className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 max-h-[90dvh] overflow-y-auto"
      >
        <header className="flex justify-between mb-4">
          <h2 className="font-bold">Applications received</h2>
          <button onClick={onClose} className="underline">
            Close
          </button>
        </header>
        {loading && <p role="status">Loading applications…</p>}
        {error && (
          <p role="alert">
            {error}{" "}
            <button onClick={() => void load()} className="underline">
              Retry
            </button>
          </p>
        )}
        {!loading && !error && !items.length && (
          <p className="text-muted-foreground">No applications yet.</p>
        )}
        {items.map((a) => (
          <article
            key={a.id}
            className="border border-border rounded-2xl p-4 my-3 space-y-2"
          >
            <h3 className="font-semibold">
              {a.user.profile?.name || "Student"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {a.user.email} · {a.user.profile?.department}
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {a.coverLetter || "No cover note provided."}
            </p>
            {a.resumeUrl && (
              <a
                className="text-primary underline text-sm"
                href={a.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View portfolio or resume
              </a>
            )}
            <label className="block text-sm">
              Application status
              <select
                aria-label={"Status for " + (a.user.profile?.name || "Student")}
                disabled={busy === a.id}
                value={a.status}
                className="ml-3 p-2 bg-secondary rounded-lg"
                onChange={async (e) => {
                  const status = e.target.value;
                  setBusy(a.id);
                  try {
                    await apiRequest(
                      "/opportunities/" +
                        opportunityId +
                        "/applications/" +
                        a.id,
                      "PATCH",
                      { status },
                    );
                    setItems((prev) =>
                      prev.map((i) => (i.id === a.id ? { ...i, status } : i)),
                    );
                    toast.success("Application status updated.");
                  } catch (e) {
                    toast.error(
                      e instanceof Error ? e.message : "Update failed.",
                    );
                  } finally {
                    setBusy("");
                  }
                }}
              >
                {["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </section>
    </div>
  );
}
