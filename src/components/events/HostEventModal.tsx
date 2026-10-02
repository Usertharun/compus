import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
export function HostEventModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, addEvent } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  useDialogAccessibility(isOpen, () => {
    if (!busy) onClose();
  });
  if (!isOpen) return null;
  const field =
    "w-full mt-1 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm";
  return (
    <div
      className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
      onClick={() => !busy && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl"
      >
        <header className="flex items-center justify-between mb-5">
          <h2 id="event-title" className="font-bold flex gap-2">
            <Calendar className="w-5 h-5" />
            Host a campus event
          </h2>
          <button aria-label="Close" disabled={busy} onClick={onClose}>
            <X />
          </button>
        </header>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            const f = new FormData(e.currentTarget);
            const start = new Date(String(f.get("start")));
            const end = new Date(String(f.get("end")));
            if (start <= new Date() || end <= start) {
              toast.error(
                "Choose a future start time and an end time after it.",
              );
              return;
            }
            setBusy(true);
            const saved = await addEvent({
              title: String(f.get("title")).trim(),
              description: String(f.get("description")).trim(),
              date: start.toISOString(),
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              venue: String(f.get("venue")).trim(),
              category: String(f.get("category")),
              host: user.name,
            });
            setBusy(false);
            if (saved) {
              toast.success("Event published. Registration is open.");
              onClose();
            }
          }}
        >
          <label className="block text-sm">
            Event title
            <input
              autoFocus
              name="title"
              required
              maxLength={200}
              className={field}
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm">
              Starts (local time)
              <input
                name="start"
                type="datetime-local"
                required
                className={field}
              />
            </label>
            <label className="text-sm">
              Ends (local time)
              <input
                name="end"
                type="datetime-local"
                required
                className={field}
              />
            </label>
          </div>
          <label className="block text-sm">
            Venue or meeting link
            <input name="venue" required maxLength={300} className={field} />
          </label>
          <label className="block text-sm">
            Category
            <select name="category" className={field}>
              {[
                "Hackathon",
                "Workshop",
                "Social",
                "Career",
                "Guest Speaker",
                "Sports",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Description
            <textarea
              name="description"
              required
              rows={4}
              maxLength={10000}
              className={field}
            />
          </label>
          <button
            disabled={busy}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
          >
            {busy ? "Publishing…" : "Publish event"}
          </button>
        </form>
      </section>
    </div>
  );
}
