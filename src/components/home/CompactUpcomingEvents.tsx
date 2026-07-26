import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_EVENTS = [
  {
    id: 1,
    title: "Intro to Machine Learning",
    date: "OCT 24",
    time: "4:00 PM - 5:30 PM",
    location: "CS Building, Room 101",
    category: "Workshop",
    attending: 45,
  },
  {
    id: 2,
    title: "Startup Pitch Night",
    date: "OCT 26",
    time: "7:00 PM - 9:00 PM",
    location: "Student Union",
    category: "Networking",
    attending: 120,
  },
  {
    id: 3,
    title: "Design Thinking Seminar",
    date: "OCT 28",
    time: "2:00 PM - 4:00 PM",
    location: "Design Studio",
    category: "Seminar",
    attending: 32,
  },
];

export function CompactUpcomingEvents() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Upcoming Events</h3>
        <Link to="/events" className="text-xs text-primary font-medium hover:underline">
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="flex gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50">
            <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg min-w-[3rem] h-12">
              <span className="text-[10px] font-bold uppercase tracking-wider">{event.date.split(" ")[0]}</span>
              <span className="text-lg font-extrabold leading-none">{event.date.split(" ")[1]}</span>
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-medium text-sm text-foreground truncate">{event.title}</h4>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.time.split(" - ")[0]}</span>
                <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /> {event.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                <span className="bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-medium">{event.category}</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3 h-3" /> {event.attending}</span>
              </div>
            </div>

            <div className="flex items-center">
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-medium">RSVP</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
