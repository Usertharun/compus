import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Smile, Hash, Sparkles, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/services/uploads";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialMediaOpen?: boolean;
}

const CATEGORIES = [
  { id: "general", label: "General" },
  { id: "projects", label: "Project" },
  { id: "discussions", label: "Discussion" },
  { id: "questions", label: "Q&A" },
  { id: "announcements", label: "Announcement" },
];

export function CreatePostModal({
  isOpen,
  onClose,
  initialCategory = "general",
  initialMediaOpen = false,
}: CreatePostModalProps) {
  const { user, addPost } = useApp();
  const toast = useToast();

  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [tagsInput, setTagsInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(initialMediaOpen);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialCategory) setSelectedCategory(initialCategory);
      if (initialMediaOpen) setIsMediaPickerOpen(true);
    }
  }, [isOpen, initialCategory, initialMediaOpen]);

  useDialogAccessibility(isOpen, () => {
    if (!isSubmitting) onClose();
  });
  const handleDeviceFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    try {
      setSelectedImage(await uploadImage(file));
      setIsMediaPickerOpen(false);
      toast.success("Image attached!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    }
  };

  const handlePostSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    // Parse hashtags from input and from content text
    const tagsFromInput = tagsInput
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, "").trim())
      .filter(Boolean);

    const tagsFromContent = (content.match(/#(\w+)/g) || []).map((t) =>
      t.slice(1),
    );
    const allTags = Array.from(
      new Set([selectedCategory, ...tagsFromInput, ...tagsFromContent]),
    );

    setIsSubmitting(true);
    const saved = await addPost(
      content,
      selectedImage,
      allTags,
      selectedImage ? "image" : "text",
    );
    setIsSubmitting(false);
    if (!saved) return;
    toast.success("Post published to Campus Feed! 🚀");

    // Reset state
    setContent("");
    setSelectedImage(null);
    setTagsInput("");
    setIsMediaPickerOpen(false);
    setCustomImageUrl("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-label="Create campus post"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4 sm:p-0"
          >
            <div className="glass-panel w-full rounded-3xl border border-border shadow-2xl max-h-[90dvh] overflow-y-auto flex flex-col bg-card">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                    Share to Campus
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-border shadow-xs"
                  />
                  <div>
                    <p className="font-bold text-sm text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.major} • {user.university}
                    </p>
                  </div>
                </div>

                {/* Category Pills Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Main Content Input */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening on campus? Share a research update, find hackathon teammates, or ask a question..."
                  className="w-full min-h-[120px] bg-transparent resize-none outline-none text-sm sm:text-base placeholder:text-muted-foreground/60 text-foreground leading-relaxed"
                  autoFocus
                />

                {/* Attached Image Preview */}
                {selectedImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-border/60 max-h-56 bg-secondary/30">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Media Picker Drawer */}
                {isMediaPickerOpen && (
                  <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/50 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span>Attach Photo or Image</span>
                      <button
                        onClick={() => setIsMediaPickerOpen(false)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Hidden device file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleDeviceFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Device Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Upload photo from device
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-border/50"></div>
                      <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-muted-foreground/60">
                        or web link
                      </span>
                      <div className="flex-grow border-t border-border/50"></div>
                    </div>

                    {/* Image URL input */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customImageUrl.trim()) {
                            setSelectedImage(customImageUrl.trim());
                            setIsMediaPickerOpen(false);
                            setCustomImageUrl("");
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                )}

                {/* Hashtags input */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/20 border border-border/40 text-xs">
                  <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Add tags separated by space (e.g. ai hackathon react)"
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Actions & Footer */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-t border-border/40 bg-secondary/10">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(!isMediaPickerOpen)}
                    className={cn(
                      "p-2 rounded-xl transition-colors cursor-pointer",
                      selectedImage || isMediaPickerOpen
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary hover:text-foreground",
                    )}
                    title="Attach Photo"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTagsInput((prev) =>
                        prev ? `${prev} campus` : "campus",
                      )
                    }
                    className="p-2 hover:bg-secondary hover:text-foreground rounded-xl transition-colors cursor-pointer"
                    title="Add #campus tag"
                  >
                    <Hash className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setContent((prev) => prev + " 🚀✨")}
                    className="p-2 hover:bg-secondary hover:text-foreground rounded-xl transition-colors cursor-pointer"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!content.trim() || isSubmitting}
                    onClick={handlePostSubmit}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all cursor-pointer shadow-md"
                  >
                    Publish Post
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreatePostModal;
