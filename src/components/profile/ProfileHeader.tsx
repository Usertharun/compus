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
  Camera,
  ExternalLink,
  Plus,
} from "lucide-react";

import { useRef } from "react";

interface ProfileHeaderProps {
  user: FullUserProfile;
  onEditProfile: (tab?: "info" | "photos" | "links") => void;
  onOpenSettings: () => void;
  onDirectPhotoUpload?: (file: File) => void;
}

export function ProfileHeader({
  user,
  onEditProfile,
  onOpenSettings,
  onDirectPhotoUpload,
}: ProfileHeaderProps) {
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onDirectPhotoUpload) {
      onDirectPhotoUpload(file);
    } else if (file) {
      onEditProfile("photos");
    }
  };

  return (
    <div className="rounded-[2.5rem] bg-card border border-border/40 overflow-hidden shadow-sm relative">
      {/* Cover Banner */}
      <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        {user.banner && (
          <img
            src={user.banner}
            alt="Profile Banner"
            className="w-full h-full object-cover opacity-85"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20" />

        <button
          onClick={() => onEditProfile("photos")}
          className="absolute top-4 right-4 p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Camera className="w-3.5 h-3.5" /> Edit Cover
        </button>
      </div>

      {/* Profile Details Container */}
      <div className="p-6 sm:p-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-20 sm:-mt-24">
          {/* Avatar & Basic Info */}
          <div className="flex items-end gap-5">
            <div className="relative group">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] object-cover ring-4 ring-card shadow-lg bg-card"
              />

              {/* Direct Camera Button on Avatar */}
              <input
                type="file"
                ref={avatarFileRef}
                onChange={handleAvatarSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => onEditProfile("photos")}
                className="absolute inset-0 bg-black/40 text-white rounded-[2rem] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer backdrop-blur-[2px]"
                title="Change Profile Photo"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-bold">Change</span>
              </button>
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
              onClick={() => onEditProfile("info")}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>

            <button
              onClick={onOpenSettings}
              className="p-3 rounded-2xl bg-secondary/60 border border-border/30 text-foreground hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="mt-8 pt-6 border-t border-border/30 flex flex-wrap items-center gap-3">
          {/* GitHub */}
          {user.githubUrl ? (
            <a
              href={
                user.githubUrl.startsWith("http")
                  ? user.githubUrl
                  : `https://${user.githubUrl}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/50 border border-border/40 text-xs sm:text-sm font-semibold text-foreground hover:bg-secondary transition-colors group"
            >
              <Code className="w-4 h-4 text-foreground" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          ) : (
            <button
              onClick={() => onEditProfile("links")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add GitHub</span>
            </button>
          )}

          {/* LinkedIn */}
          {user.linkedinUrl ? (
            <a
              href={
                user.linkedinUrl.startsWith("http")
                  ? user.linkedinUrl
                  : `https://${user.linkedinUrl}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/50 border border-border/40 text-xs sm:text-sm font-semibold text-foreground hover:bg-secondary transition-colors group"
            >
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          ) : (
            <button
              onClick={() => onEditProfile("links")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add LinkedIn</span>
            </button>
          )}

          {/* Portfolio */}
          {user.portfolioUrl ? (
            <a
              href={
                user.portfolioUrl.startsWith("http")
                  ? user.portfolioUrl
                  : `https://${user.portfolioUrl}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/50 border border-border/40 text-xs sm:text-sm font-semibold text-foreground hover:bg-secondary transition-colors group"
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Portfolio</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          ) : (
            <button
              onClick={() => onEditProfile("links")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Portfolio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
