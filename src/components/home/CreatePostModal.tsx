import { motion, AnimatePresence } from "framer-motion";
import { X, Image, Paperclip, Smile, MapPin } from "lucide-react";
import { STUDENT_PROFILE } from "@/data/homeMockData";
import { useState } from "react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4 sm:p-0"
          >
            <div className="bg-card w-full rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <h3 className="text-lg font-bold">Create Post</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={STUDENT_PROFILE.avatar}
                    alt={STUDENT_PROFILE.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{STUDENT_PROFILE.name}</p>
                    <p className="text-xs text-muted-foreground">Posting to Campus Feed</p>
                  </div>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind? Share an update, ask a question, or find collaborators..."
                  className="w-full min-h-[120px] bg-transparent resize-none outline-none text-base placeholder:text-muted-foreground/60"
                  autoFocus
                />
              </div>

              {/* Actions & Footer */}
              <div className="p-4 flex items-center justify-between border-t border-border/40 bg-accent/20">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <button className="p-2 hover:bg-accent hover:text-foreground rounded-full transition-colors">
                    <Image className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-accent hover:text-foreground rounded-full transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-accent hover:text-foreground rounded-full transition-colors hidden sm:block">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-accent hover:text-foreground rounded-full transition-colors hidden sm:block">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>

                <button
                  disabled={!content.trim()}
                  onClick={() => {
                    // Logic to post...
                    onClose();
                    setContent("");
                  }}
                  className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                >
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
