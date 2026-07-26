import { useState, useRef, useEffect } from "react";
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  Sparkles, 
  ChevronDown, 
  GraduationCap,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "./types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const DEFAULT_USER: UserProfile = {
  name: "Alex Rivera",
  email: "arivera@stanford.edu",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  campusName: "Stanford University",
  majorYear: "CS Class of '26",
  statusText: "Studying at Green Library 📚",
};

export function UserMenuDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full transition-all duration-200 cursor-pointer",
          "border border-border/60 hover:border-border bg-background/50 hover:bg-accent/60",
          "active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          isOpen && "bg-accent border-border shadow-xs"
        )}
      >
        <div className="relative">
          <img
            src={DEFAULT_USER.avatarUrl}
            alt={DEFAULT_USER.name}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
        </div>
        <span className="hidden md:inline-block text-xs font-semibold text-foreground max-w-[100px] truncate">
          {DEFAULT_USER.name}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute right-0 mt-3 w-72 rounded-2xl z-50 overflow-hidden",
              "bg-background/95 backdrop-blur-2xl border border-border/80",
              "shadow-2xl shadow-black/15 ring-1 ring-black/5"
            )}
          >
            {/* User Profile Info Header */}
            <div className="p-4 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-3">
                <img
                  src={DEFAULT_USER.avatarUrl}
                  alt={DEFAULT_USER.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-foreground truncate">{DEFAULT_USER.name}</h4>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{DEFAULT_USER.email}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-background border border-border/60 text-[11px] text-muted-foreground">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{DEFAULT_USER.statusText}</span>
              </div>

              {/* Campus affiliation */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  {DEFAULT_USER.campusName}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-accent font-semibold text-[10px]">
                  {DEFAULT_USER.majorYear}
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-accent transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                View Profile & Portfolio
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-accent transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Account Settings
              </button>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>Appearance</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase bg-accent px-2 py-0.5 rounded-md">
                  {isDarkMode ? "Dark" : "Light"}
                </span>
              </button>
            </div>

            {/* Footer / Sign out */}
            <div className="p-1.5 border-t border-border/60 bg-muted/20">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
