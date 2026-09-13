import { BottomNavigation } from "@/components/common/BottomNavigation";
import { cn } from "@/lib/utils";

export function BottomNav({ className }: { className?: string }) {
  return <BottomNavigation className={cn("lg:hidden", className)} />;
}

export default BottomNav;

