import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { MessageSquare, X } from "lucide-react";
export function FeedbackButton() {
  const toast = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  useDialogAccessibility(open, () => {
    if (!busy) setOpen(false);
  });
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 lg:bottom-5 right-4 z-40 rounded-full shadow-lg border border-border bg-card text-foreground px-4 py-2 text-xs font-semibold flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Feedback
      </button>
      {open && (
        <div className="fixed inset-0 z-[120] bg-black/60 p-4 flex items-center justify-center">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full max-w-lg rounded-3xl bg-card border border-border p-6"
          >
            <header className="flex justify-between mb-4">
              <h2 id="feedback-title" className="font-bold">
                Help improve Compus
              </h2>
              <button
                disabled={busy}
                onClick={() => setOpen(false)}
                aria-label="Close feedback"
              >
                <X />
              </button>
            </header>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (busy) return;
                const f = new FormData(e.currentTarget);
                setBusy(true);
                try {
                  await apiRequest("/feedback", "POST", {
                    category: String(f.get("category")),
                    message: String(f.get("message")).trim(),
                    page: location.pathname,
                  });
                  toast.success(
                    "Feedback saved. Thank you for helping improve Compus.",
                  );
                  setOpen(false);
                } catch (e) {
                  toast.error(
                    e instanceof Error
                      ? e.message
                      : "Feedback could not be sent.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="block text-sm">
                Type
                <select
                  name="category"
                  className="w-full p-3 mt-1 rounded-xl bg-secondary border border-border"
                >
                  <option value="BUG">Report a bug</option>
                  <option value="IDEA">Suggest an improvement</option>
                  <option value="OTHER">Other feedback</option>
                </select>
              </label>
              <label className="block text-sm">
                Your feedback
                <textarea
                  autoFocus
                  name="message"
                  required
                  maxLength={5000}
                  rows={5}
                  placeholder="What happened, or what would make Compus more useful?"
                  className="w-full p-3 mt-1 rounded-xl bg-secondary/30 border border-border"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Your feedback is shared with the Compus owner together with your
                campus account and the current page.
              </p>
              <button
                disabled={busy}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-bold disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send feedback"}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
