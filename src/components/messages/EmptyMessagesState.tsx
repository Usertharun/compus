import { MessageSquarePlus, Sparkles, Users, Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface EmptyMessagesStateProps {
  onDiscoverClick?: () => void;
}

export function EmptyMessagesState({ onDiscoverClick }: EmptyMessagesStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onDiscoverClick) {
      onDiscoverClick();
    } else {
      navigate("/discover");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[460px] w-full rounded-3xl bg-card border border-border/80 shadow-xs relative overflow-hidden"
    >
      {/* Subtle Radial Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl -top-20 pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6 flex flex-col items-center">
        {/* Premium Graphic Illustration Composition */}
        <div className="relative flex items-center justify-center">
          {/* Outer Ring */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full rounded-[22px] bg-background flex items-center justify-center">
              <MessageSquarePlus className="w-10 h-10 text-indigo-500" />
            </div>
          </div>

          {/* Floating Micro Badges */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -top-2 -right-2 p-2 rounded-2xl bg-emerald-500 text-white shadow-lg border border-background"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="absolute -bottom-2 -left-2 p-2 rounded-2xl bg-purple-500 text-white shadow-lg border border-background"
          >
            <Users className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Headline & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            No conversations yet
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
            Start connecting with students. Discover study partners, hackathon teammates, and upperclassmen mentors across campus.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleAction}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer group"
        >
          <Compass className="w-4 h-4 text-indigo-200 group-hover:rotate-45 transition-transform duration-300" />
          <span>Discover Students</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
