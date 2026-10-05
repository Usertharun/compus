import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/services/api";
import {
  avatar,
  formatDate,
  type Community,
  type Post,
  type Page,
} from "@/services/models";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { uploadImage } from "@/services/uploads";
import type { CommunityItem } from "./types";
import { ArrowLeft, Heart, Share2, Send, Users, Upload, Palette, ExternalLink } from "lucide-react";
interface JoinRequest {
  id: string;
  message?: string;
  user: { profile?: { name: string }; email: string };
}
export function CommunityDetailView({
  community,
  onBack,
}: {
  community: CommunityItem;
  onBack: () => void;
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, startChatWithUser, refreshData } = useApp();
  const [detail, setDetail] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [tab, setTab] = useState("posts");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [customBanner, setCustomBanner] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const read = useCallback(async () => {
    const d = await apiRequest<Community>('/communities/' + encodeURIComponent(community.slug || community.id));
    const [p, r] = await Promise.all([
      apiRequest<Page<Post>>('/communities/' + community.id + '/feed?limit=20'),
      d.userRole === 'OWNER' || d.userRole === 'MODERATOR' ? apiRequest<JoinRequest[]>('/communities/' + d.id + '/requests') : Promise.resolve([]),
    ]);
    return { d, p, r };
  }, [community.id, community.slug]);
  const accept = useCallback(({ d, p, r }: Awaited<ReturnType<typeof read>>) => {
    setDetail(d); setPosts(p.items); setCursor(p.nextCursor || null); setRequests(r); setError('');
  }, []);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      accept(await read());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load community.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let stopped = false;
    void read().then(result => { if (!stopped) accept(result); })
      .catch(e => { if (!stopped) setError(e instanceof Error ? e.message : 'Unable to load community.'); })
      .finally(() => { if (!stopped) setLoading(false); });
    return () => { stopped = true; };
  }, [read, accept]);
  const run = async (path: string, method: string, data?: unknown) => {
    if (busy) return false;
    setBusy(true);
    try {
      await apiRequest(path, method, data);
      await load();
      void refreshData();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save changes.");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const joined = !!detail?.userRole;
  const manager =
    detail?.userRole === "OWNER" || detail?.userRole === "MODERATOR";
  const primaryColor = detail?.primaryColor || "#4f46e5";
  const accentColor = detail?.accentColor || "#9333ea";
  const themeStyle = detail?.themeStyle || "GRADIENT";
  const bannerStyle = detail?.bannerUrl
    ? { backgroundImage: `url(${detail.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : themeStyle === "SOLID"
      ? { background: primaryColor }
      : themeStyle === "MINIMAL"
        ? { background: `linear-gradient(110deg, ${primaryColor} 0 12%, color-mix(in srgb, ${primaryColor} 12%, transparent) 12% 100%)` }
        : { background: `linear-gradient(120deg, ${primaryColor}, ${accentColor})` };
  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between">
        <button onClick={onBack} className="flex gap-2 text-sm items-center">
          <ArrowLeft className="w-4 h-4" />
          Back to communities
        </button>
        <button
          aria-label="Share community"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                window.location.origin +
                  "/communities?community=" +
                  encodeURIComponent(community.slug || ""),
              );
              toast.success("Community link copied.");
            } catch {
              toast.error("Unable to copy the community link.");
            }
          }}
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      <header className="rounded-3xl border border-border bg-card overflow-hidden">
        <div
          className="h-32"
          style={bannerStyle}
        />
        <div className="p-6 space-y-3">
          <img
            src={avatar(community.name, detail?.avatarUrl)}
            alt=""
            className="w-20 h-20 rounded-2xl -mt-16 border-4 border-card"
          />
          <h1 className="text-2xl font-extrabold">
            {detail?.name || community.name}
          </h1>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {detail?.description || community.description}
          </p>
          <p className="text-sm flex gap-2 items-center">
            <Users className="w-4 h-4" />
            {detail?.memberCount ?? community.memberCount} members ·{" "}
            {community.category}
          </p>
          {!!detail?.tags?.length && <div className="flex flex-wrap gap-2">{detail.tags.map(tag => <span key={tag} className="text-xs rounded-full px-3 py-1 border" style={{ borderColor: primaryColor, color: primaryColor }}>#{tag}</span>)}</div>}
          <div className="flex flex-wrap gap-3 text-sm">
            {[
              ["Website", detail?.websiteUrl],
              ["Instagram", detail?.instagramUrl],
              ["LinkedIn", detail?.linkedinUrl],
              ["GitHub", detail?.githubUrl],
            ].filter((entry): entry is [string, string] => !!entry[1]).map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium" style={{ color: primaryColor }}>{label}<ExternalLink className="w-3 h-3" /></a>)}
          </div>
          {detail?.userRole === "OWNER" ? (
            <span className="text-xs font-semibold text-primary">
              You own this community
            </span>
          ) : (
            <button
              disabled={
                busy ||
                loading ||
                !!detail?.hasPendingRequest ||
                detail?.joinPolicy === "INVITE_ONLY"
              }
              className="rounded-xl px-4 py-2 bg-primary text-primary-foreground font-semibold disabled:opacity-50"
              onClick={() =>
                void run(
                  "/communities/" +
                    community.id +
                    (joined
                      ? "/leave"
                      : detail?.joinPolicy === "APPROVAL_REQUIRED"
                        ? "/request"
                        : "/join"),
                  joined ? "DELETE" : "POST",
                  {},
                )
              }
            >
              {busy
                ? "Saving…"
                : detail?.hasPendingRequest
                  ? "Request pending"
                  : joined
                    ? "Leave community"
                    : detail?.joinPolicy === "APPROVAL_REQUIRED"
                      ? "Request to join"
                      : detail?.joinPolicy === "INVITE_ONLY"
                        ? "Invitation required"
                        : "Join community"}
            </button>
          )}
        </div>
      </header>
      <div className="flex gap-2">
        {["posts", "members", ...(manager ? ["requests", "manage"] : [])].map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "rounded-xl px-4 py-2 text-sm capitalize " +
                (tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border")
              }
            >
              {t}
              {t === "requests" ? ` (${requests.length})` : ""}
            </button>
          ),
        )}
      </div>
      {loading && (
        <p role="status" className="text-muted-foreground">
          Loading community…
        </p>
      )}
      {error && (
        <p role="alert">
          {error}{" "}
          <button className="underline" onClick={() => void load()}>
            Retry
          </button>
        </p>
      )}
      {tab === "posts" && (
        <div className="space-y-4">
          {joined && (
            <form
              className="rounded-3xl p-4 border border-border bg-card space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  draft.trim() &&
                  (await run("/feed/posts", "POST", {
                    content: draft.trim(),
                    communityId: community.id,
                    category: "CLUB_UPDATE",
                  }))
                )
                  setDraft("");
              }}
            >
              <textarea
                aria-label="Community post"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={10000}
                placeholder="Share an update with this community…"
                className="w-full bg-secondary/30 border border-border rounded-xl p-3"
                rows={3}
              />
              <button
                disabled={busy || !draft.trim()}
                className="bg-primary text-primary-foreground rounded-xl py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {busy ? "Publishing…" : "Publish"}
              </button>
            </form>
          )}
          {!loading && !posts.length && (
            <p className="text-muted-foreground text-sm p-6 border border-border rounded-2xl">
              {joined
                ? "No posts yet. Start the conversation."
                : "Join this community to see member posts."}
            </p>
          )}
          {posts.map((p) => (
            <article
              key={p.id}
              className="bg-card rounded-3xl p-5 border border-border space-y-3"
            >
              <header className="flex items-center gap-3">
                <img
                  alt=""
                  src={avatar(
                    p.author.profile?.name || "Student",
                    p.author.profile?.avatarUrl,
                  )}
                  className="w-9 h-9 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-sm">
                    {p.author.profile?.name || "Student"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                {p.authorId === user.id && (
                  <button
                    disabled={busy}
                    className="ml-auto text-xs text-destructive"
                    onClick={() => {
                      if (window.confirm("Delete this post?"))
                        void run("/feed/posts/" + p.id, "DELETE");
                    }}
                  >
                    Delete
                  </button>
                )}
              </header>
              <p className="text-sm whitespace-pre-wrap">{p.content}</p>
              {p.media?.[0] && (
                <img
                  src={p.media[0].url}
                  alt="Post attachment"
                  className="rounded-xl max-h-80 object-cover"
                />
              )}
              <button
                disabled={busy}
                className={
                  "flex items-center gap-2 text-sm " +
                  (p.isLiked ? "text-primary" : "text-muted-foreground")
                }
                onClick={() =>
                  void run(
                    "/feed/posts/" + p.id + "/like",
                    p.isLiked ? "DELETE" : "POST",
                  )
                }
              >
                <Heart className="w-4 h-4" />
                {p.likeCount} likes
              </button>
            </article>
          ))}
          {cursor && (
            <button
              disabled={busy}
              className="underline text-sm"
              onClick={async () => {
                setBusy(true);
                try {
                  const p = await apiRequest<Page<Post>>(
                    "/communities/" +
                      community.id +
                      "/feed?limit=20&cursor=" +
                      encodeURIComponent(cursor),
                  );
                  setPosts((prev) => [...prev, ...p.items]);
                  setCursor(p.nextCursor || null);
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Unable to load posts.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Load more posts
            </button>
          )}
        </div>
      )}
      {tab === "members" && (
        <div className="grid sm:grid-cols-2 gap-3">
          {detail?.members?.map((m) => (
            <div
              key={m.user.id}
              className="p-4 rounded-2xl border border-border bg-card flex gap-3 items-center"
            >
              <img
                alt=""
                src={avatar(
                  m.user.profile?.name || "Student",
                  m.user.profile?.avatarUrl,
                )}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {m.user.profile?.name || "Student"}
                </p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              {m.user.id !== user.id && (
                <button
                  className="text-primary text-sm"
                  onClick={() => {
                    startChatWithUser({
                      id: m.user.id,
                      name: m.user.profile?.name || "Student",
                      avatar: avatar(
                        m.user.profile?.name || "Student",
                        m.user.profile?.avatarUrl,
                      ),
                    });
                    navigate("/messages");
                  }}
                >
                  Message
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Showing the 10 most recent members.
          </p>
        </div>
      )}
      {tab === "requests" && manager && (
        <div className="space-y-3">
          {!requests.length && (
            <p className="text-muted-foreground">No pending requests.</p>
          )}
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-card rounded-2xl border border-border p-4 space-y-3"
            >
              <p className="font-semibold text-sm">
                {r.user.profile?.name || r.user.email}
              </p>
              <p className="text-sm">{r.message}</p>
              <div className="flex gap-3">
                <button
                  disabled={busy}
                  className="text-primary text-sm"
                  onClick={() =>
                    void run(
                      "/communities/requests/" + r.id + "/accept",
                      "POST",
                    )
                  }
                >
                  Accept
                </button>
                <button
                  disabled={busy}
                  className="text-muted-foreground text-sm"
                  onClick={() =>
                    void run(
                      "/communities/requests/" + r.id + "/reject",
                      "POST",
                    )
                  }
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "manage" && manager && (
        <form
          key={detail?.id}
          className="bg-card rounded-3xl p-5 border border-border space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const optionalUrl = (name: string) => String(f.get(name) || "").trim() || undefined;
            if (
              await run("/communities/" + community.id, "PATCH", {
                name: String(f.get("name")).trim(),
                description: String(f.get("description")).trim(),
                category: String(f.get("category")).trim(),
                joinPolicy: String(f.get("policy")),
                avatarUrl: customAvatar ?? detail?.avatarUrl ?? "",
                bannerUrl: customBanner ?? detail?.bannerUrl ?? "",
                primaryColor: String(f.get("primaryColor")),
                accentColor: String(f.get("accentColor")),
                themeStyle: String(f.get("themeStyle")),
                tags: String(f.get("tags") || "").split(",").map(tag => tag.trim().replace(/^#/, "").toLowerCase()).filter(Boolean).slice(0, 12),
                websiteUrl: optionalUrl("websiteUrl"),
                instagramUrl: optionalUrl("instagramUrl"),
                linkedinUrl: optionalUrl("linkedinUrl"),
                githubUrl: optionalUrl("githubUrl"),
              })
            )
              toast.success("Club page design saved.");
          }}
        >
          <header>
            <h2 className="font-bold text-lg flex items-center gap-2"><Palette className="w-5 h-5" />Design your club page</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose your identity, colors, images and public links. Changes appear immediately on the public club page.</p>
          </header>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block text-sm">Club name<input name="name" required maxLength={100} defaultValue={detail?.name} className="w-full rounded-xl bg-secondary p-3 mt-1" /></label>
            <label className="block text-sm">Category<input name="category" required maxLength={80} defaultValue={detail?.category} placeholder="Technology, Arts, Sports…" className="w-full rounded-xl bg-secondary p-3 mt-1" /></label>
          </div>
          <label className="block text-sm">About the club<textarea name="description" required maxLength={10000} defaultValue={detail?.description} rows={5} className="w-full rounded-xl bg-secondary p-3 mt-1" /></label>
          <label className="block text-sm">Interests and topics<input name="tags" defaultValue={detail?.tags?.join(", ")} placeholder="robotics, design, competitions" className="w-full rounded-xl bg-secondary p-3 mt-1" /><span className="text-xs text-muted-foreground">Separate up to 12 tags with commas.</span></label>

          <section className="space-y-3">
            <h3 className="font-semibold">Logo and banner</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="rounded-2xl border border-dashed border-border p-4 text-sm cursor-pointer">
                <span className="flex items-center gap-2 font-medium"><Upload className="w-4 h-4" />Upload club logo</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { setCustomAvatar(await uploadImage(file)); } catch (error) { toast.error(error instanceof Error ? error.message : "Logo upload failed."); } finally { setUploading(false); } }} />
                {(customAvatar ?? detail?.avatarUrl) && <img src={customAvatar ?? detail?.avatarUrl} alt="Club logo preview" className="w-20 h-20 object-cover rounded-2xl mt-3" />}
              </label>
              <label className="rounded-2xl border border-dashed border-border p-4 text-sm cursor-pointer">
                <span className="flex items-center gap-2 font-medium"><Upload className="w-4 h-4" />Upload page banner</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { setCustomBanner(await uploadImage(file)); } catch (error) { toast.error(error instanceof Error ? error.message : "Banner upload failed."); } finally { setUploading(false); } }} />
                {(customBanner ?? detail?.bannerUrl) && <img src={customBanner ?? detail?.bannerUrl} alt="Club banner preview" className="w-full h-20 object-cover rounded-xl mt-3" />}
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold">Colors and style</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="text-sm">Primary color<input name="primaryColor" type="color" defaultValue={primaryColor} className="w-full h-12 rounded-xl bg-secondary p-1 mt-1" /></label>
              <label className="text-sm">Accent color<input name="accentColor" type="color" defaultValue={accentColor} className="w-full h-12 rounded-xl bg-secondary p-1 mt-1" /></label>
              <label className="text-sm">Banner style<select name="themeStyle" defaultValue={themeStyle} className="w-full rounded-xl bg-secondary p-3 mt-1"><option value="GRADIENT">Creative gradient</option><option value="SOLID">Bold solid</option><option value="MINIMAL">Minimal</option></select></label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold">Public links</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input aria-label="Website" name="websiteUrl" type="url" defaultValue={detail?.websiteUrl} placeholder="https://club.example.com" className="rounded-xl bg-secondary p-3" />
              <input aria-label="Instagram" name="instagramUrl" type="url" defaultValue={detail?.instagramUrl} placeholder="https://instagram.com/club" className="rounded-xl bg-secondary p-3" />
              <input aria-label="LinkedIn" name="linkedinUrl" type="url" defaultValue={detail?.linkedinUrl} placeholder="https://linkedin.com/company/club" className="rounded-xl bg-secondary p-3" />
              <input aria-label="GitHub" name="githubUrl" type="url" defaultValue={detail?.githubUrl} placeholder="https://github.com/club" className="rounded-xl bg-secondary p-3" />
            </div>
          </section>

          <label className="block text-sm">Membership<select name="policy" defaultValue={detail?.joinPolicy} className="w-full rounded-xl bg-secondary p-3 mt-1"><option value="OPEN">Open to campus</option><option value="APPROVAL_REQUIRED">Approval required</option><option value="INVITE_ONLY">Closed to new members</option></select></label>
          <button
            disabled={busy || uploading}
            className="bg-primary text-primary-foreground rounded-xl py-3 px-5 font-semibold disabled:opacity-50"
          >
            {uploading ? "Uploading image…" : busy ? "Saving design…" : "Save club page"}
          </button>
        </form>
      )}
    </div>
  );
}
