import { useState, useEffect, useRef } from "react";
import { FullUserProfile } from "./types";
import { X, Check, Sparkles, Upload, Camera, Code, Briefcase, Globe, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EditProfileModalProps {
  isOpen: boolean;
  user: FullUserProfile;
  onClose: () => void;
  onSave: (updated: Partial<FullUserProfile>) => void;
  defaultTab?: "info" | "photos" | "links";
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
];

const PRESET_BANNERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
];

export function EditProfileModal({ isOpen, user, onClose, onSave, defaultTab = "info" }: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "photos" | "links">(defaultTab);
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [year, setYear] = useState(user.year);
  const [statusText, setStatusText] = useState(user.statusText);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [banner, setBanner] = useState(user.banner);
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl || "");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name);
    setDepartment(user.department);
    setYear(user.year);
    setStatusText(user.statusText);
    setBio(user.bio);
    setAvatar(user.avatar);
    setBanner(user.banner);
    setGithubUrl(user.githubUrl || "");
    setLinkedinUrl(user.linkedinUrl || "");
    setPortfolioUrl(user.portfolioUrl || "");
    setActiveTab(defaultTab);
  }, [user, defaultTab, isOpen]);

  if (!isOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBanner(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      department,
      year,
      statusText,
      bio,
      avatar,
      banner,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl rounded-3xl bg-card border border-border/80 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0">
            <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Edit Student Profile
            </h3>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/40 border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "info" 
                  ? "bg-primary text-primary-foreground shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("photos")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "photos" 
                  ? "bg-primary text-primary-foreground shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Photos & Banner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "links" 
                  ? "bg-primary text-primary-foreground shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Portfolio & Social Links
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1 scrollbar-hide">
            {/* TAB 1: BASIC INFO */}
            {activeTab === "info" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Department / Major</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Class Year</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="e.g. Senior Class of '26"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Status Badge</label>
                  <input
                    type="text"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    placeholder="e.g. Studying at Green Library 📚"
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Bio / About Me</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    placeholder="Share what you are building or studying..."
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PHOTOS & BANNER */}
            {activeTab === "photos" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Avatar Section */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40 space-y-3">
                  <label className="font-bold text-foreground block">Profile Picture (Avatar)</label>
                  <div className="flex items-center gap-4">
                    <img 
                      src={avatar} 
                      alt="Avatar Preview" 
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/30 shadow-md shrink-0" 
                    />
                    <div className="space-y-2 flex-1">
                      <input 
                        type="file" 
                        ref={avatarInputRef} 
                        onChange={handleAvatarFile} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-xs"
                      >
                        <Camera className="w-4 h-4" /> Upload Custom Photo
                      </button>
                      <p className="text-[11px] text-muted-foreground">Supports JPG, PNG or WEBP from your device.</p>
                    </div>
                  </div>

                  {/* Preset Avatar choices */}
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Or choose a student avatar preset:</p>
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {PRESET_AVATARS.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatar(p)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            avatar === p ? "border-primary ring-2 ring-primary/40 scale-105" : "border-border/60 hover:opacity-80"
                          }`}
                        >
                          <img src={p} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banner Section */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/40 space-y-3">
                  <label className="font-bold text-foreground block">Profile Cover Banner</label>
                  <div className="h-20 w-full rounded-xl overflow-hidden border border-border/60 relative">
                    <img src={banner} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={bannerInputRef} 
                      onChange={handleBannerFile} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Banner Image
                    </button>
                  </div>

                  {/* Banner Presets */}
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Preset banner themes:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_BANNERS.map((b, i) => (
                        <div
                          key={i}
                          onClick={() => setBanner(b)}
                          className={`h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            banner === b ? "border-primary ring-2 ring-primary/40" : "border-border/60 hover:opacity-80"
                          }`}
                        >
                          <img src={b} alt="Banner option" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SOCIAL & PORTFOLIO LINKS */}
            {activeTab === "links" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-muted-foreground">
                  Connect your developer profiles and showcase your projects directly to campus peers and recruiters.
                </p>

                {/* GitHub */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-2">
                    <Code className="w-4 h-4 text-foreground" />
                    <span>GitHub Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-username"
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-username"
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Portfolio Website */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span>Personal Portfolio / Website URL</span>
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-border/40 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default EditProfileModal;
