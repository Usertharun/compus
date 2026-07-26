import { useState } from "react";
import { STUDENTS_DATA, Student } from "@/data/studentsData";
import { MessageSquare, MapPin, Sparkles, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ActiveStudents() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const activeList = STUDENTS_DATA.slice(0, 10);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Active on Campus Now
          </h2>
          <p className="text-xs text-muted-foreground font-normal">Connect with students studying & hanging out on campus</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          ● {activeList.length} Online
        </span>
      </div>

      {/* Horizontal Avatar Row */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {activeList.map((student, index) => (
          <motion.button
            key={student.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            onClick={() => setSelectedStudent(student)}
            className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer focus:outline-none"
          >
            {/* Avatar Ring */}
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 group-hover:scale-105 transition-transform duration-200">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-background"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
            </div>

            {/* Name & Major */}
            <div className="text-center max-w-[80px]">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {student.name.split(" ")[0]}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {student.department.split(" ")[0]}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick Profile Popover Dialog */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-background border border-border p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
                  />
                  <div>
                    <h3 className="font-bold text-base text-foreground">{selectedStudent.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedStudent.department} · {selectedStudent.year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-accent/50 border border-border/50 text-xs text-foreground space-y-1">
                <p className="font-semibold text-primary">About</p>
                <p className="line-clamp-2">{selectedStudent.bio}</p>
                <div className="pt-1 flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{selectedStudent.campus}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="py-2.5 px-4 rounded-xl bg-accent text-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-accent/80 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Connect
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
