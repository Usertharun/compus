import { useState } from "react";
import { apiRequest } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { ExternalLink, X } from "lucide-react";
export function ProfilePortfolio() {
  const { profile, refreshData } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = async (
    path: string,
    method: "POST" | "DELETE",
    data?: unknown,
  ) => {
    if (busy) return;
    setBusy(true);
    try {
      await apiRequest(path, method, data);
      await refreshData();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save profile.");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const field =
    "rounded-xl bg-secondary/30 border border-border p-3 w-full text-sm";
  return (
    <div className="space-y-6">
      <section className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <h2 className="font-bold">Skills</h2>
        <p className="text-xs text-muted-foreground">
          Skills you share with campus. These are self-reported.
        </p>
        <div className="flex flex-wrap gap-2">
          {profile?.skills?.map((s) => (
            <span
              key={s.skill.id}
              className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 text-sm"
            >
              {s.skill.name}
              <button
                disabled={busy}
                aria-label={"Remove " + s.skill.name}
                onClick={() =>
                  void run("/profile/skills/" + s.skill.id, "DELETE")
                }
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = String(new FormData(form).get("skill")).trim();
            if (
              name &&
              (await run("/profile/skills", "POST", { skillName: name }))
            )
              form.reset();
          }}
        >
          <input
            name="skill"
            aria-label="Add a skill"
            placeholder="Add a skill, e.g. React"
            maxLength={80}
            required
            className={field}
          />
          <button
            disabled={busy}
            className="bg-primary text-primary-foreground px-4 rounded-xl text-sm"
          >
            Add
          </button>
        </form>
      </section>
      <section className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <h2 className="font-bold">Projects</h2>
        {!profile?.projects?.length && (
          <p className="text-sm text-muted-foreground">
            Add a project to show what you are building.
          </p>
        )}
        {profile?.projects?.map((p) => (
          <article
            key={p.id}
            className="border border-border rounded-2xl p-4 space-y-2"
          >
            <div className="flex justify-between gap-3">
              <h3 className="font-semibold">{p.title}</h3>
              <button
                disabled={busy}
                aria-label={"Delete project " + p.title}
                onClick={() => {
                  if (window.confirm("Delete this project from your profile?"))
                    void run("/profile/projects/" + p.id, "DELETE");
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
              {p.description}
            </p>
            {p.projectUrl && (
              <a
                href={p.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm inline-flex gap-1"
              >
                View project
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </article>
        ))}
        <details>
          <summary className="cursor-pointer text-primary font-semibold text-sm">
            Add a project
          </summary>
          <form
            className="space-y-3 mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              if (
                await run("/profile/projects", "POST", {
                  title: String(f.get("title")).trim(),
                  description: String(f.get("description")).trim(),
                  startDate: String(f.get("start")),
                  ...(f.get("url") ? { projectUrl: String(f.get("url")) } : {}),
                })
              )
                form.reset();
            }}
          >
            <label className="block text-sm">
              Project title
              <input name="title" required maxLength={200} className={field} />
            </label>
            <label className="block text-sm">
              Description
              <textarea
                name="description"
                required
                rows={3}
                maxLength={5000}
                className={field}
              />
            </label>
            <label className="block text-sm">
              Started
              <input name="start" type="date" required className={field} />
            </label>
            <label className="block text-sm">
              Project link (optional)
              <input name="url" type="url" className={field} />
            </label>
            <button
              disabled={busy}
              className="bg-primary text-primary-foreground rounded-xl px-4 py-2"
            >
              {busy ? "Saving…" : "Save project"}
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
