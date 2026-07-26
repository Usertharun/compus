import { ACTIVE_STUDENTS } from "@/data/homeMockData";

export function SidebarActiveStudents() {
  return (
    <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground">Active on Campus</h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {ACTIVE_STUDENTS.length} Online
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {ACTIVE_STUDENTS.slice(0, 5).map((student) => (
          <div key={student.id} className="flex items-center gap-3 cursor-pointer group">
            <div className="relative shrink-0">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-background shadow-sm group-hover:scale-105 transition-transform"
              />
              {student.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {student.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {student.locationTag}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full text-xs font-semibold text-primary hover:text-primary/80 transition-colors pt-2 border-t border-border/40">
        View all active students
      </button>
    </div>
  );
}
