import { FullUserProfile } from "./types";
import { Sparkles, Eye, Users, FolderGit2, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileBioSectionProps {
  user: FullUserProfile;
}

export function ProfileBioSection({ user }: ProfileBioSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Bio & Status */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-500" />
            About & Bio
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {user.statusText}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
          {user.bio}
        </p>
      </div>

      {/* Right Col: Quick Stats */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Profile Analytics
        </h2>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-accent/40 border border-border/40">
            <Eye className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
            <p className="text-base font-extrabold text-foreground">{user.profileViews}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Views</p>
          </div>

          <div className="p-3 rounded-2xl bg-accent/40 border border-border/40">
            <Users className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
            <p className="text-base font-extrabold text-foreground">{user.connectionsCount}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Network</p>
          </div>

          <div className="p-3 rounded-2xl bg-accent/40 border border-border/40">
            <FolderGit2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-base font-extrabold text-foreground">{user.projectsCount}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Projects</p>
          </div>
        </div>
      </div>
    </div>
  );
}
