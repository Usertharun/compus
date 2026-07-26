import { useState } from "react";
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  ShieldCheck, 
  Key, 
  LogOut, 
  Save, 
  Laptop,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const SETTINGS_TABS = [
  { id: "account", label: "Account & Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Moon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Privacy & Security", icon: ShieldCheck },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("account");
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [name, setName] = useState(user.name || "Alex Rivera");
  const [email, setEmail] = useState(user.email || "arivera@stanford.edu");
  const [major, setMajor] = useState(user.major || "Computer Science");
  const [bio, setBio] = useState(user.bio || "Building open-source tools and capstone projects.");
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(() => {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  // Toggles
  const [notifications, setNotifications] = useState({
    dm: true,
    events: true,
    communities: false,
    digest: true,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showLocation: true,
    allowDirectMessages: true,
  });

  const handleThemeChange = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode as any);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (mode === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    toast.success(`Theme set to ${mode}`);
  };

  const handleSave = () => {
    updateUser({ name, email, major, bio });
    setIsSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("compus_auth");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Settings & Preferences
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Manage your profile, theme, notifications and security settings.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>

      {/* Glass Bubble Tab Navigation */}
      <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap cursor-pointer z-10 flex-1 justify-center",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="settingsTabGlassBubble"
                  className="absolute inset-0 bg-background/90 dark:bg-card/90 rounded-xl shadow-sm border border-border/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-20" />
              <span className="relative z-20">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl">
        <AnimatePresence mode="wait">
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-bold text-foreground">Profile Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground px-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground px-1">University Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1">Major / Field of Study</label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-bold text-foreground">Theme Preference</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleThemeChange("light")}
                  className={cn(
                    "p-5 rounded-2xl border text-center flex flex-col items-center gap-3 transition-all cursor-pointer",
                    themeMode === "light"
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-sm"
                      : "bg-secondary/20 border-border/50 hover:bg-secondary/40"
                  )}
                >
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span className="text-sm font-bold text-foreground">Light Mode</span>
                </button>

                <button
                  onClick={() => handleThemeChange("dark")}
                  className={cn(
                    "p-5 rounded-2xl border text-center flex flex-col items-center gap-3 transition-all cursor-pointer",
                    themeMode === "dark"
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-sm"
                      : "bg-secondary/20 border-border/50 hover:bg-secondary/40"
                  )}
                >
                  <Moon className="w-6 h-6 text-indigo-400" />
                  <span className="text-sm font-bold text-foreground">Dark Mode</span>
                </button>

                <button
                  onClick={() => handleThemeChange("system")}
                  className={cn(
                    "p-5 rounded-2xl border text-center flex flex-col items-center gap-3 transition-all cursor-pointer",
                    themeMode === "system"
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-sm"
                      : "bg-secondary/20 border-border/50 hover:bg-secondary/40"
                  )}
                >
                  <Laptop className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">System Auto</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-foreground mb-4">Notification Preferences</h2>

              {Object.entries({
                dm: "Direct Message Notifications",
                events: "Upcoming Event Reminders",
                communities: "Community Post Updates",
                digest: "Weekly Campus Digest Email",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/40">
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                      notifications[key as keyof typeof notifications] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5",
                      notifications[key as keyof typeof notifications] ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-bold text-foreground">Privacy & Security</h2>

              {Object.entries({
                profilePublic: "Public Profile Visibility on Campus",
                showLocation: "Display Study Location Status",
                allowDirectMessages: "Allow Direct DMs from Students",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/40">
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <button
                    onClick={() => setPrivacy(prev => ({ ...prev, [key]: !prev[key as keyof typeof privacy] }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                      privacy[key as keyof typeof privacy] ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5",
                      privacy[key as keyof typeof privacy] ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Controls */}
        <div className="pt-6 mt-6 border-t border-border/40 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
