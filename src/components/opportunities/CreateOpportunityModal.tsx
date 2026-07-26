import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, MapPin, DollarSign, Building, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOpportunityModal({ isOpen, onClose }: CreateOpportunityModalProps) {
  const { user } = useApp();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState("Internship");
  const [compensation, setCompensation] = useState("");
  const [location, setLocation] = useState("Remote / Hybrid");
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setTitle("");
      setCompany("");
      setCompensation("");
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
              <Briefcase className="w-5 h-5 text-emerald-500" />
              Post Campus Opportunity
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
              <h4 className="font-bold text-xl text-foreground">Opportunity Posted Live!</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Your posting <span className="font-semibold text-foreground">"{title}"</span> at <span className="font-semibold text-foreground">{company}</span> is now live on the Opportunities board.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground px-1">Role / Position Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Engineer Intern - Summer 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground px-1">Organization / Company</label>
                  <div className="relative flex items-center">
                    <Building className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stripe / AI Lab"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground px-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Research">Research Assistant</option>
                    <option value="Project">Project Collaborator</option>
                    <option value="Part-time">Part-Time Role</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground px-1">Compensation / Pay</label>
                  <div className="relative flex items-center">
                    <DollarSign className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. $45/hr or Stipend"
                      value={compensation}
                      onChange={(e) => setCompensation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground px-1">Location</label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA / Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground px-1">Requirements & Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe responsibilities, required skills, and application instructions..."
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Post Opportunity
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
