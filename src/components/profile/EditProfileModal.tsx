import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useState } from "react";
import type { FullUserProfile } from "./types";
import { uploadImage } from "@/services/uploads";
import { useToast } from "@/context/ToastContext";
import { X } from "lucide-react";
interface Props {
  isOpen: boolean;
  user: FullUserProfile;
  onClose: () => void;
  onSave: (updated: Partial<FullUserProfile>) => Promise<boolean>;
  defaultTab?: "info" | "photos" | "links";
}
export function EditProfileModal({
  isOpen,
  user,
  onClose,
  onSave,
  defaultTab = "info",
}: Props) {
  const toast = useToast();
  const [tab, setTab] = useState(defaultTab);
  const [draft, setDraft] = useState<FullUserProfile>(user);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  useDialogAccessibility(isOpen, () => {
    if (!busy && !uploading) onClose();
  });
  if (!isOpen) return null;
  const field =
    "w-full mt-1 rounded-xl border border-border bg-secondary/30 p-3 text-sm";
  const input = (
    key:
      | "name"
      | "department"
      | "year"
      | "statusText"
      | "githubUrl"
      | "linkedinUrl"
      | "portfolioUrl",
    title: string,
    type = "text",
  ) => (
    <label key={key} className="block text-sm">
      {title}
      <input
        value={draft[key] || ""}
        type={type}
        required={key === "name"}
        maxLength={key.includes("Url") ? 1000 : 150}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, [key]: e.target.value }))
        }
        className={field}
      />
    </label>
  );
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-3xl border border-border bg-card p-6"
      >
        <header className="flex justify-between mb-4">
          <h2 id="edit-profile-title" className="font-bold">
            Edit student profile
          </h2>
          <button
            disabled={busy || uploading}
            onClick={onClose}
            aria-label="Close profile editor"
          >
            <X />
          </button>
        </header>
        <div className="flex gap-2 mb-5">
          {(["info", "photos", "links"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-4 py-2 rounded-xl text-sm capitalize " +
                (tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary")
              }
            >
              {t}
            </button>
          ))}
        </div>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || uploading) return;
            setBusy(true);
            const updated =
              tab === "info"
                ? {
                    name: draft.name.trim(),
                    department: draft.department,
                    year: draft.year,
                    statusText: draft.statusText,
                    bio: draft.bio,
                  }
                : tab === "links"
                  ? {
                      githubUrl: draft.githubUrl,
                      linkedinUrl: draft.linkedinUrl,
                      portfolioUrl: draft.portfolioUrl,
                    }
                  : { avatar: draft.avatar, banner: draft.banner };
            const saved = await onSave(updated);
            setBusy(false);
            if (saved) onClose();
          }}
        >
          {tab === "info" && (
            <>
              {input("name", "Name")}
              {input("department", "Department")}
              {input("year", "Graduation year")}
              {input("statusText", "Study location (optional)")}
              <label className="block text-sm">
                Bio
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={draft.bio || ""}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className={field}
                />
              </label>
            </>
          )}
          {tab === "links" && (
            <>
              {input("githubUrl", "GitHub URL", "url")}
              {input("linkedinUrl", "LinkedIn URL", "url")}
              {input("portfolioUrl", "Portfolio URL", "url")}
            </>
          )}
          {tab === "photos" && (
            <div className="space-y-5">
              {(["avatar", "banner"] as const).map((key) => (
                <div key={key}>
                  <label className="block text-sm capitalize">
                    {key} image
                    <input
                      disabled={uploading || busy}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className={field}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const url = await uploadImage(file);
                          setDraft((prev) => ({ ...prev, [key]: url }));
                        } catch (e) {
                          toast.error(
                            e instanceof Error ? e.message : "Upload failed.",
                          );
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                  </label>
                  {draft[key] && (
                    <img
                      src={draft[key]}
                      alt={key + " preview"}
                      className={
                        "mt-3 object-cover rounded-2xl " +
                        (key === "avatar" ? "w-20 h-20" : "w-full h-32")
                      }
                    />
                  )}
                  {key === "banner" && draft.banner && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, banner: "" }))
                      }
                      className="mt-2 text-sm underline"
                    >
                      Remove banner
                    </button>
                  )}
                </div>
              ))}
              {uploading && (
                <p role="status" className="text-sm text-muted-foreground">
                  Uploading image…
                </p>
              )}
            </div>
          )}
          <button
            disabled={busy || uploading}
            className="rounded-xl bg-primary text-primary-foreground py-3 w-full font-bold disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
}
