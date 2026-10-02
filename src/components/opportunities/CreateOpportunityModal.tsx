import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useState } from "react";
import { X, Briefcase } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import type { CampusOpportunity } from "@/data/opportunitiesData";
export function CreateOpportunityModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addOpportunity } = useApp();
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
        aria-labelledby="opportunity-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl"
      >
        <header className="flex items-center justify-between mb-5">
          <h2 id="opportunity-title" className="font-bold flex gap-2">
            <Briefcase className="w-5 h-5" />
            Post a campus opportunity
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
            setBusy(true);
            const saved = await addOpportunity({
              title: String(f.get("title")).trim(),
              company: String(f.get("company")).trim(),
              type: String(f.get("category")) as CampusOpportunity["type"],
              location: String(f.get("location")).trim(),
              description: String(f.get("description")).trim(),
              stipendOrPrize: String(f.get("stipend")).trim(),
              applicationUrl: String(f.get("url")).trim() || undefined,
              deadline: String(f.get("deadline")),
              tags: [],
            });
            setBusy(false);
            if (saved) {
              toast.success("Opportunity published.");
              onClose();
            }
          }}
        >
          <label className="block text-sm">
            Role title
            <input
              autoFocus
              name="title"
              required
              maxLength={200}
              className={field}
            />
          </label>
          <label className="block text-sm">
            Organization or team
            <input name="company" required maxLength={200} className={field} />
          </label>
          <label className="block text-sm">
            Type
            <select name="category" className={field}>
              {[
                "Internship",
                "Research",
                "Grant",
                "Club Role",
                "Project",
                "Part-time",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Location
            <input
              name="location"
              required
              placeholder="Campus, remote, or city"
              className={field}
            />
          </label>
          <label className="block text-sm">
            Compensation (optional)
            <input name="stipend" className={field} />
          </label>
          <label className="block text-sm">
            Deadline (optional, local time)
            <input name="deadline" type="datetime-local" className={field} />
          </label>
          <label className="block text-sm">
            External application link (optional)
            <input
              name="url"
              type="url"
              placeholder="https://…"
              className={field}
            />
            <span className="text-xs text-muted-foreground">
              Leave blank to receive applications inside Compus.
            </span>
          </label>
          <label className="block text-sm">
            Requirements and details
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
            {busy ? "Publishing…" : "Publish opportunity"}
          </button>
        </form>
      </section>
    </div>
  );
}
