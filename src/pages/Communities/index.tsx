import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import CollectionPager from '@/components/common/CollectionPager';
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { apiRequest } from "@/services/api";
import { avatar, type Community } from "@/services/models";
import { CommunityCard, CommunityDetailView } from "@/components/communities";
import type { CommunityItem } from "@/components/communities/types";
import { Search, Plus, X, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
export const mapCommunity = (c: Community): CommunityItem => ({
  id: c.id,
  slug: c.slug,
  joinPolicy: c.joinPolicy,
  name: c.name,
  category: c.category,
  description: c.description,
  fullBio: c.description,
  memberCount: c.memberCount,
  iconName: "Users",
  avatarUrl: avatar(c.name, c.avatarUrl),
  bannerGradient: "from-indigo-600 to-purple-600",
  bannerImage: c.bannerUrl,
  isJoined: !!c.userRole,
  recentPosts: [],
  upcomingEvents: [],
  featuredMembers: (c.members || []).map((m) => ({
    id: m.user.id,
    name: m.user.profile?.name || "Student",
    avatar: avatar(
      m.user.profile?.name || "Student",
      m.user.profile?.avatarUrl,
    ),
    role: m.role,
    major: "",
  })),
});
export default function CommunitiesPage() {
  const { communities, refreshData, loading } = useApp();
  const { user: account } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<CommunityItem | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  useDialogAccessibility(creating, () => {
    if (!busy) setCreating(false);
  });
  const slug = params.get("community");
  useEffect(() => {
    let stopped = false;
    // Clear selection in the navigation handler; asynchronous responses below are guarded.
    if (slug)
      void apiRequest<Community>("/communities/" + encodeURIComponent(slug))
        .then((c) => {
          if (!stopped) setSelected(mapCommunity(c));
        })
        .catch((e) => toast.error(e.message));
    return () => {
      stopped = true;
    };
  }, [slug, toast]);
  const categories = ["All", ...new Set(communities.map((c) => c.category))];
  const filtered = communities.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (c.name + " " + c.description)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const field =
    "w-full mt-1 rounded-xl bg-secondary/30 border border-border px-3 py-2.5 text-sm";
  if (selected && slug === selected.slug)
    return (
      <CommunityDetailView
        community={selected}
        onBack={() => {
          setParams({});
          setSelected(null);
        }}
      />
    );
  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex gap-2 items-center">
            <Users />
            Campus communities
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Find your people, share ideas, and build together.
          </p>
        </div>
        {account?.role !== "COMMUNITY_ACCOUNT" && <button
          onClick={() => setCreating(true)}
          className="rounded-2xl bg-primary text-primary-foreground font-bold text-sm px-4 py-3 flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Create community
        </button>}
      </header>
      <label className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card">
        <Search className="w-5 h-5" />
        <input
          aria-label="Search communities"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search communities…"
          className="w-full bg-transparent outline-none"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={
              "rounded-xl px-4 py-2 shrink-0 text-sm " +
              (c === category
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border")
            }
          >
            {c}
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
          {loading
            ? "Loading communities…"
            : "No communities found. Create one or try another search."}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <CommunityCard
            key={c.id}
            community={mapCommunity(c)}
            onCardClick={() => setParams({ community: c.slug })}
          />
        ))}
      </div>
      {creating && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-community-title"
            className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg max-h-[90dvh] overflow-y-auto"
          >
            <header className="flex justify-between mb-5">
              <h2 id="create-community-title" className="font-bold">
                Create a community
              </h2>
              <button
                aria-label="Close"
                disabled={busy}
                onClick={() => setCreating(false)}
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
                  const c = await apiRequest<Community>(
                    "/communities",
                    "POST",
                    {
                      name: String(f.get("name")).trim(),
                      slug: String(f.get("slug")).trim(),
                      description: String(f.get("description")).trim(),
                      category: String(f.get("category")),
                      joinPolicy: String(f.get("policy")),
                    },
                  );
                  await refreshData();
                  setCreating(false);
                  setParams({ community: c.slug });
                  toast.success("Community created. You are its owner.");
                } catch (e) {
                  toast.error(
                    e instanceof Error
                      ? e.message
                      : "Unable to create community.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="block text-sm">
                Name
                <input
                  autoFocus
                  name="name"
                  required
                  maxLength={100}
                  className={field}
                />
              </label>
              <label className="block text-sm">
                Community address
                <input
                  name="slug"
                  required
                  pattern="[a-z0-9-]+"
                  maxLength={80}
                  placeholder="srm-design-club"
                  className={field}
                />
                <span className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens.
                </span>
              </label>
              <label className="block text-sm">
                Category
                <select name="category" className={field}>
                  {[
                    "Technology",
                    "Business",
                    "Creative",
                    "Sports",
                    "Interest Group",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Membership
                <select name="policy" className={field}>
                  <option value="OPEN">Anyone on campus can join</option>
                  <option value="APPROVAL_REQUIRED">
                    Owner approval required
                  </option>
                </select>
              </label>
              <label className="block text-sm">
                Description
                <textarea
                  name="description"
                  rows={4}
                  required
                  maxLength={10000}
                  className={field}
                />
              </label>
              <button
                disabled={busy}
                className="bg-primary text-primary-foreground font-bold rounded-xl w-full py-3 disabled:opacity-50"
              >
                {busy ? "Creating…" : "Create community"}
              </button>
            </form>
          </section>
        </div>
      )}
      <CollectionPager collections={['communities']} />
    </div>
  );
}
