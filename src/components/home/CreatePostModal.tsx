import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Paperclip, Smile, MapPin, Hash, BarChart2, Sparkles, Check, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

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

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop",
];

export function CreatePostModal({ isOpen, onClose, initialCategory = "general", initialMediaOpen = false }: CreatePostModalProps) {
  const { user, addPost } = useApp();
  const toast = useToast();
  
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [tagsInput, setTagsInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(initialMediaOpen);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialCategory) setSelectedCategory(initialCategory);
      if (initialMediaOpen) setIsMediaPickerOpen(true);
    }
  }, [isOpen, initialCategory, initialMediaOpen]);

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setIsMediaPickerOpen(false);
      toast.success("Image attached!");
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = () => {
    if (!content.trim()) return;

    // Parse hashtags from input and from content text
    const tagsFromInput = tagsInput
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, "").trim())
      .filter(Boolean);

    const tagsFromContent = (content.match(/#(\w+)/g) || []).map((t) => t.slice(1));
    const allTags = Array.from(new Set([selectedCategory, ...tagsFromInput, ...tagsFromContent]));

    addPost(content, selectedImage, allTags, selectedImage ? "image" : "text");
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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4 sm:p-0"
          >
            <div className="glass-panel w-full rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col bg-card">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-base sm:text-lg font-extrabold text-foreground">Share to Campus</h3>
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
                    <p className="font-bold text-sm text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.major} • {user.university}</p>
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
                          : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
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
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
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
                      <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-muted-foreground/60">or web link</span>
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

                    {/* Presets */}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Or select campus photo:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {PRESET_IMAGES.map((img, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              setSelectedImage(img);
                              setIsMediaPickerOpen(false);
                            }}
                            className={cn(
                              "h-14 rounded-xl overflow-hidden border cursor-pointer hover:opacity-90 transition-all",
                              selectedImage === img ? "ring-2 ring-primary border-primary" : "border-border/60"
                            )}
                          >
                            <img src={img} alt="preset" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
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
                      selectedImage || isMediaPickerOpen ? "bg-primary/10 text-primary" : "hover:bg-secondary hover:text-foreground"
                    )}
                    title="Attach Photo"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTagsInput((prev) => prev ? `${prev} campus` : "campus")}
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
                    disabled={!content.trim()}
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
