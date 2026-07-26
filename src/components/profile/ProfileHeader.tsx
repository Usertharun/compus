import { FullUserProfile } from "./types";
import { 
  ShieldCheck, 
  GraduationCap, 
  MapPin, 
  Code, 
  Briefcase, 
  Globe, 
  Edit3, 
  Settings,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  user: FullUserProfile;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

export function ProfileHeader({ user, onEditProfile, onOpenSettings }: ProfileHeaderProps) {
  return (
    <div className="rounded-[2.5rem] bg-card border border-border/40 overflow-hidden shadow-sm relative">
      {/* Cover Banner */}
      <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <img
          src={user.banner}
          alt="Profile Banner"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20" />

        <button
          onClick={onEditProfile}
          className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" /> Edit Cover
        </button>
      </div>

      {/* Profile Details Container */}
      <div className="p-6 sm:p-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-20 sm:-mt-24">
          {/* Avatar & Basic Info */}
          <div className="flex items-end gap-5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] object-cover ring-4 ring-card shadow-lg"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-card" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {user.name}
                </h1>
                <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
              </div>

              <p className="text-sm font-semibold text-primary">
                {user.department}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium pt-0.5">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  {user.year}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {user.campus}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit Profile & Settings */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={onEditProfile}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>

            <button
              onClick={onOpenSettings}
              className="p-3 rounded-2xl bg-accent/60 border border-border/30 text-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="mt-8 pt-6 border-t border-border/30 flex items-center gap-3">
          <a
            href={user.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/50 border border-border/30 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Code className="w-4 h-4" /> GitHub
          </a>
          <a
            href={user.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/50 border border-border/30 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Briefcase className="w-4 h-4 text-blue-500" /> LinkedIn
          </a>
          <a
            href={user.portfolioUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/50 border border-border/30 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Globe className="w-4 h-4 text-indigo-500" /> Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
