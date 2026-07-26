import { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Users, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Rocket, 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const ONBOARDING_STEPS = [
  { id: "welcome", title: "Welcome to COMPUS", subtitle: "Select what you want to achieve on campus" },
  { id: "profile", title: "Setup Your Profile", subtitle: "Help classmates find and connect with you" },
  { id: "ready", title: "You're All Set!", subtitle: "Your digital campus workspace is ready" },
];

const GOAL_OPTIONS = [
  { id: "mentors", label: "Find Mentors", icon: GraduationCap, desc: "Connect with upperclassmen & alumni" },
  { id: "clubs", label: "Join Student Orgs", icon: Users, desc: "Discover tech, design & sports clubs" },
  { id: "jobs", label: "Discover Internships", icon: Briefcase, desc: "Apply for campus & tech roles" },
  { id: "hackathons", label: "Hackathons", icon: Sparkles, desc: "Form teams & build projects" },
  { id: "study", label: "Study Partners", icon: BookOpen, desc: "Find peers for your courses" },
];

export default function Onboarding() {
  const { user, updateUser } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user.name);
  const [major, setMajor] = useState(user.major);
  const [gradYear, setGradYear] = useState(user.gradYear);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["mentors", "clubs"]);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      updateUser({
        name: name.trim() || user.name,
        major: major.trim() || user.major,
        gradYear: gradYear.trim() || user.gradYear,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || user.name)}`,
      });
      navigate("/campus");
    }
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-indigo-500/20">
      {/* Background Ambient Glow */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" 
      />

      {/* Progress Dots Bar */}
      <div className="absolute top-8 sm:top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {ONBOARDING_STEPS.map((_, i) => (
          <motion.div 
            key={i} 
            animate={{
              width: i === step ? 28 : 8,
              backgroundColor: i === step ? "var(--primary)" : i < step ? "var(--primary)" : "var(--border)"
            }}
            className="h-2 rounded-full transition-all duration-300"
          />
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-card/80 backdrop-blur-2xl rounded-3xl border border-border/60 shadow-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
                {ONBOARDING_STEPS[step].title}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {ONBOARDING_STEPS[step].subtitle}
              </p>
            </div>

            {/* Step Contents */}
            <div className="min-h-[260px] flex flex-col justify-center">
              {step === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground px-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera" 
                      className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground px-1">Major / Field</label>
                      <input 
                        type="text" 
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="Computer Science" 
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground px-1">Graduation Year</label>
                      <select 
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                      >
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all duration-200 cursor-pointer relative overflow-hidden",
                          isSelected 
                            ? "bg-primary/10 border-primary/40 shadow-sm" 
                            : "bg-card border-border/40 hover:bg-secondary/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <goal.icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                          {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                          <span className={cn("text-sm font-bold block", isSelected ? "text-foreground" : "text-muted-foreground")}>
                            {goal.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-tight block mt-0.5">
                            {goal.desc}
                          </span>
                        </div>
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-4 py-4"
                >
                  <motion.div 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 shadow-lg shadow-primary/20"
                  >
                    <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Welcome aboard, {name}!</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      We've tailored your {major} feed with your selected preferences.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              <span>{step === ONBOARDING_STEPS.length - 1 ? "Enter Campus Network" : "Continue"}</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}