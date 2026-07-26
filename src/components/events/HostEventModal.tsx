import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Clock, Tag, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface HostEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HostEventModal({ isOpen, onClose }: HostEventModalProps) {
  const { user } = useApp();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Hackathon");
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setDescription("");
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-3xl glass-panel p-6 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Host a Campus Event
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-xl text-foreground">Event Published Live!</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Your event <span className="font-semibold text-foreground">"{title}"</span> is now listed on the Campus Events board.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground px-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Innovation Sprint & Hackathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground px-1">Date</label>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground px-1">Time</label>
                  <div className="relative flex items-center">
                    <Clock className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. 5:00 PM - 8:00 PM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground px-1">Location</label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Huang Engineering Center"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground px-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Social">Social</option>
                    <option value="Career">Career Fair</option>
                    <option value="Guest Speaker">Guest Speaker</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground px-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="What is this event about? Who should attend?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
                >
                  Publish Event
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
