import { useState, useEffect } from "react";
import { FullUserProfile } from "./types";
import { X, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EditProfileModalProps {
  isOpen: boolean;
  user: FullUserProfile;
  onClose: () => void;
  onSave: (updated: Partial<FullUserProfile>) => void;
}

export function EditProfileModal({ isOpen, user, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [year, setYear] = useState(user.year);
  const [statusText, setStatusText] = useState(user.statusText);
  const [bio, setBio] = useState(user.bio);

  useEffect(() => {
    setName(user.name);
    setDepartment(user.department);
    setYear(user.year);
    setStatusText(user.statusText);
    setBio(user.bio);
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, department, year, statusText, bio });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-3xl bg-background border border-border/80 p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Edit Student Profile
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-accent/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Department / Major</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-accent/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Class Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-accent/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                className="w-full p-2.5 rounded-xl bg-accent/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Bio / About Me</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-accent/40 border border-border/60 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-accent text-foreground font-bold hover:bg-accent/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-xs"
              >
                <Check className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
