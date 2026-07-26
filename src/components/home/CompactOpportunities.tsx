import { Link } from "react-router-dom";
import { Briefcase, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_OPPORTUNITIES = [
  {
    id: 1,
    title: "Software Engineer Intern",
    company: "Google",
    skills: "React, TypeScript",
    deadline: "2 days left",
  },
  {
    id: 2,
    title: "Product Design Intern",
    company: "Apple",
    skills: "Figma, UX Research",
    deadline: "1 week left",
  },
  {
    id: 3,
    title: "Marketing Associate",
    company: "Campus Tech",
    skills: "Social Media, Content",
    deadline: "3 weeks left",
  },
];

export function CompactOpportunities() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Campus Opportunities</h3>
        <Link to="/opportunities" className="text-xs text-primary font-medium hover:underline">
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_OPPORTUNITIES.map((opp) => (
          <div key={opp.id} className="flex gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50">
            <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-xl text-xl">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-medium text-sm text-foreground truncate">{opp.title}</h4>
              <p className="text-[11px] text-muted-foreground truncate">{opp.company}</p>
              
              <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                <span className="bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-medium">{opp.skills}</span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <Clock className="w-3 h-3" /> {opp.deadline}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-medium">Apply</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
