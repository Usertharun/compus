import { GraduationCap, PlusCircle, Calendar, TrendingUp, Zap } from "lucide-react";
import { STUDENTS_DATA } from "@/data/studentsData";
import { motion } from "framer-motion";

export function GreetingHeader() {
  const currentStudent = STUDENTS_DATA[0]; // Aarav Sharma, IIT Bombay

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/15"
    >
      {/* Radial Background Accents */}
      <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute right-32 -bottom-10 w-48 h-48 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Content */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-100">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-200" />
            <span>{currentStudent.campus}</span>
            <span className="opacity-40">•</span>
            <span className="text-white font-bold">{currentStudent.department}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            {getGreetingTime()} 👋 <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-100">
              {currentStudent.name}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            You have <strong className="text-white font-semibold">15 upcoming campus events</strong>, 2 active hackathon team invites, and 20 new opportunities closing this month.
          </p>

          {/* Micro Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-indigo-100/80">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>15 Events Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>20 Active Communities</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-cyan-300" />
              <span>40 Students Connected</span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-600 font-bold text-xs sm:text-sm shadow-lg shadow-black/10 hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            Create Post
          </button>
        </div>
      </div>
    </motion.div>
  );
}
