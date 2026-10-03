import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TopAppBar } from "./TopAppBar";
import { BottomNav } from "./BottomNav";
import { AppLayoutProps } from "./types";
import { cn } from "@/lib/utils";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { CreatePostModal } from "@/components/home/CreatePostModal";
import { HostEventModal } from "@/components/events/HostEventModal";
import { CreateOpportunityModal } from "@/components/opportunities/CreateOpportunityModal";
import { useApp } from "@/context/AppContext";
import { FeedbackButton } from "./FeedbackButton";

export function AppLayout({
  children,
  pageTitle,
  pageSubtitle,
  hideTopBar = false,
  hideBottomNav = false,
  maxWidthClass = "max-w-[1440px]",
}: AppLayoutProps) {
  const location = useLocation();
  const {
    isCreatePostOpen,
    closeCreatePost,
    createPostCategory,
    createPostMediaOpen,
    isHostEventOpen,
    closeHostEvent,
    isCreateOppOpen,
    closeCreateOpp,
    loading,
    dataError,
    refreshData,
  } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close all modals automatically on route change
  useEffect(() => {
    // Route navigation is an external event; closing global dialogs prevents stale overlays.
    closeCreatePost();
    closeHostEvent();
    closeCreateOpp();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [location.pathname, closeCreatePost, closeHostEvent, closeCreateOpp]);

  const isMessagesPage = location.pathname.startsWith("/messages");
  const isCampusPage =
    location.pathname === "/" || location.pathname.startsWith("/campus");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-indigo-500/20 selection:text-indigo-600 font-sans transition-colors duration-200 relative">
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
          className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8"
          aria-live="polite"
        >
          {loading && (
            <p role="status" className="py-3 text-sm text-muted-foreground">
              Loading campus data…
            </p>
          )}
          {dataError && (
            <div
              role="alert"
              className="my-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
            >
              <p>Some campus data could not be loaded. Please try again.</p>
              <button
                onClick={() => void refreshData()}
                disabled={loading}
                className="mt-2 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>
        <div
          className={cn(
            "mx-auto px-4 sm:px-6 lg:px-8",
            isMessagesPage
              ? "py-2 pb-20 sm:pb-24 lg:py-4 lg:pb-6"
              : "py-6 pb-24 lg:pb-8",
            maxWidthClass,
          )}
        >
          {isMessagesPage ? (
            // Dedicated Messages Workspace with desktop sidebar (Golden Proportion: 280px nav : remainder workspace)
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] gap-7 xl:gap-9 items-start">
              <LeftSidebar />
              <div className="w-full h-[calc(100dvh-9.5rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-7.5rem)]">
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
            </div>
          ) : isCampusPage ? (
            // 3-Column Feed layout: Golden Ratio Proportion (280px Nav : ~680px Feed : 340px Pulse/Connect)
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_330px] xl:grid-cols-[300px_minmax(0,1fr)_350px] gap-7 xl:gap-9 items-start">
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
          ) : (
            // 2-Column Dedicated Page Workspace (Golden Proportion)
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] gap-7 xl:gap-9 items-start max-w-[1440px] mx-auto">
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
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Navigation (Mobile Only) */}
      {!hideBottomNav && <BottomNav />}
      {!isMessagesPage && <FeedbackButton />}

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
              className="fixed inset-y-0 left-0 z-[101] w-[85%] max-w-sm bg-background border-r border-border shadow-2xl p-5 overflow-y-auto lg:hidden flex flex-col pb-10"
            >
              <MobileNavDrawer onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      {isCreatePostOpen && <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={closeCreatePost}
        initialCategory={createPostCategory}
        initialMediaOpen={createPostMediaOpen}
      />}
      <HostEventModal isOpen={isHostEventOpen} onClose={closeHostEvent} />
      <CreateOpportunityModal
        isOpen={isCreateOppOpen}
        onClose={closeCreateOpp}
      />
    </div>
  );
}

export default AppLayout;
