import { useState } from "react";
import { Sparkles, ArrowRight, GraduationCap, Lock, Mail, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export default function Login() {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [otpCode, setOtpCode] = useState(["1", "2", "3", "4"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (mode === "signup") {
        setShowVerification(true);
      } else {
        setIsSuccess(true);
        localStorage.setItem("compus_auth", "true");
        if (email.includes("@")) {
          updateUser({ email, name: email.split("@")[0].replace(".", " ").replace(/^./, c => c.toUpperCase()) });
        }
        setTimeout(() => {
          navigate("/campus");
        }, 800);
      }
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code.length < 4) {
      setError("Please enter the 4-digit code.");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      localStorage.setItem("compus_auth", "true");
      if (email.includes("@")) {
        updateUser({ email, name: email.split("@")[0].replace(".", " ").replace(/^./, c => c.toUpperCase()) });
      }
      setTimeout(() => {
        navigate("/onboarding");
      }, 800);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-indigo-500/20">
      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center space-y-3">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <Sparkles className="w-7 h-7 fill-white/20" />
            </motion.div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
                COMPUS
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                Your digital campus ecosystem
              </p>
            </div>
          </div>

          {/* Glass Bubble Mode Switcher */}
          <div className="flex items-center glass-pill p-1 rounded-2xl relative">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer relative z-10",
                mode === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode === "login" && (
                <motion.div
                  layoutId="loginTabBubble"
                  className="absolute inset-0 bg-background/90 dark:bg-card/90 rounded-xl shadow-sm border border-border/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-20">Sign In</span>
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer relative z-10",
                mode === "signup" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode === "signup" && (
                <motion.div
                  layoutId="loginTabBubble"
                  className="absolute inset-0 bg-background/90 dark:bg-card/90 rounded-xl shadow-sm border border-border/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-20">Create Account</span>
            </button>
          </div>

          {/* Verification Form Step */}
          {showVerification ? (
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleVerifyOtp}
              className="space-y-5 py-2"
            >
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Verify Your Email</h2>
                <p className="text-xs text-muted-foreground">
                  We sent a 4-digit code to <span className="font-semibold text-foreground">{email || "your university email"}</span>.
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                  Demo Code: 1234
                </span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newCode = [...otpCode];
                      newCode[idx] = e.target.value;
                      setOtpCode(newCode);
                    }}
                    className="w-12 h-12 rounded-xl text-center font-bold text-lg bg-secondary/30 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Verified! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Back to Sign Up
              </button>
            </motion.form>
          ) : (
            /* Form */
            <AnimatePresence mode="wait">
            <motion.form 
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 15 : -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1">University Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@stanford.edu"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-secondary/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-muted-foreground">Password</label>
                  {mode === "login" && (
                    <button type="button" className="text-[11px] text-primary font-medium hover:underline">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm bg-secondary/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={cn(
                  "w-full py-3.5 px-6 rounded-xl flex items-center justify-center gap-2",
                  "bg-primary text-primary-foreground font-bold text-sm",
                  "hover:opacity-90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 cursor-pointer",
                  (isLoading || isSuccess) && "opacity-80"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : isSuccess ? (
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{mode === "login" ? "Welcome Back!" : "Account Created!"}</span>
                  </motion.div>
                ) : (
                  <>
                    <span>{mode === "login" ? "Sign In to Campus" : "Get Started"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>
          )}

          {/* Footer Note */}
          <div className="pt-2 text-center border-t border-border/40">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              Verified for University Students & Alumni
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
