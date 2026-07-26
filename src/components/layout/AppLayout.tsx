import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TopAppBar } from "./TopAppBar";
import { BottomNav } from "./BottomNav";
import { AppLayoutProps } from "./types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { WelcomeSidebarCard } from "@/components/home/WelcomeSidebarCard";
import { QuickNavMenu } from "@/components/home/QuickNavMenu";
import { SidebarFeaturedCommunities } from "@/components/home/SidebarFeaturedCommunities";
import { X } from "lucide-react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";

export function AppLayout({
  children,
  pageTitle,
  pageSubtitle,
  hideTopBar = false,
  hideBottomNav = false,
  maxWidthClass = "max-w-[1440px]", // Increased max width for 3-panel layout
}: AppLayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine if we should force hide sidebars on specific routes (e.g. Messages)
  const isMessagesPage = location.pathname.startsWith("/messages");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-indigo-500/20 selection:text-indigo-600 font-sans transition-colors duration-200 relative overflow-x-hidden">
      {/* Background Liquid Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[160px]" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, 50, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[130px]" 
        />
      </div>

      {/* Top App Bar */}
      {!hideTopBar && (
        <TopAppBar 
          title={pageTitle} 
          subtitle={pageSubtitle} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <div
          className={cn(
            "mx-auto px-4 sm:px-6 lg:px-8 py-6",
            "pb-28", // Bottom padding to account for floating nav on all screen sizes
            maxWidthClass
          )}
        >
          {isMessagesPage ? (
            // Full width for specific pages like Messages (adjusted height so bottom nav doesn't cover composer)
            <div className="w-full h-[calc(100vh-11.5rem)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  {children || <Outlet />}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            // 3-Panel Layout
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1.2fr] xl:grid-cols-[20%_55%_25%] gap-6 xl:gap-8 items-start">
              <LeftSidebar />
              
              <div className="w-full min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-full"
                  >
                    {children || <Outlet />}
                  </motion.div>
                </AnimatePresence>
              </div>

              <RightSidebar />
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      {!hideBottomNav && <BottomNav />}

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[101] w-[85%] max-w-sm bg-background border-r border-border shadow-2xl p-4 overflow-y-auto lg:hidden flex flex-col gap-5 pb-24"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold tracking-tight text-xl text-foreground font-sans">COMPUS</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <WelcomeSidebarCard />
              <QuickNavMenu />
              <SidebarFeaturedCommunities />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppLayout;
