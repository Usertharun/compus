import { useState } from "react";
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  BarChart2, 
  Send, 
  Check, 
  Trash2, 
  Flag, 
  Sparkles,
  Smile,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp, PostItem } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function CampusPostFeed() {
  const { 
    posts, 
    toggleLikePost, 
    toggleSavePost, 
    deletePost, 
    addPostComment, 
    votePollOption, 
    searchQuery, 
    user,
    startChatWithUser 
  } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [openComments, setOpenComments] = useState<Record<string | number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string | number, string>>({});
  const [heartAnimPostId, setHeartAnimPostId] = useState<string | number | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | number | null>(null);

  // Instagram-style double tap to like
  const handleDoubleTap = (post: PostItem) => {
    if (!post.liked) {
      toggleLikePost(post.id);
    }
    setHeartAnimPostId(post.id);
    setTimeout(() => {
      setHeartAnimPostId(null);
    }, 900);
  };

  const handleVote = (postId: string | number, option: string) => {
    votePollOption(postId, option);
    toast.success(`Voted for "${option}"!`);
  };

  const handleShare = (postId: string | number) => {
    const postUrl = `${window.location.origin}/campus#${postId}`;
    navigator.clipboard?.writeText?.(postUrl);
    toast.success("Post link copied to clipboard! 📋");
  };

  const toggleCommentsDrawer = (postId: string | number) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId: string | number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    addPostComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    toast.success("Comment added!");
  };

  const handleMessageAuthor = (author: { name: string; avatar: string }) => {
    startChatWithUser({ name: author.name, avatar: author.avatar, isOnline: true });
    navigate("/messages");
  };

  // Filter posts based on global search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 pb-20">
      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground glass-panel rounded-3xl space-y-3 p-8 border border-border/50">
          <Sparkles className="w-12 h-12 mx-auto text-primary/30" />
          <p className="font-bold text-base text-foreground">No posts matching "{searchQuery}"</p>
          <p className="text-xs">Try searching for keywords like "ai", "treehacks", "design", or clear your filter.</p>
        </div>
      ) : (
        filteredPosts.map((post) => {
          const isCommentsOpen = openComments[post.id];
          const postComments = post.commentsList || [];
          const isAuthor = post.author.name === user.name;
          const totalPollVotes = post.pollOptions?.reduce((acc, opt) => acc + opt.votes, 0) || 0;

          return (
            <div 
              key={post.id} 
              id={String(post.id)}
              className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4 transition-all duration-300 hover:shadow-xl border border-border/50 bg-card/60 backdrop-blur-md relative"
            >
              {/* Author Header */}
              <div className="flex items-start justify-between gap-3">
                <div 
                  className="flex gap-3 items-center cursor-pointer group"
                  onClick={() => handleMessageAuthor(post.author)}
                  title={`View ${post.author.name}'s profile & send message`}
                >
                  <div className="relative">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name} 
                      className="w-11 h-11 rounded-full object-cover border border-border shadow-xs group-hover:ring-2 ring-primary/30 transition-all" 
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span>{post.author.name}</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {post.author.title} • {post.timestamp}
                    </p>
                  </div>
                </div>

                {/* More Options Dropdown Menu */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>

                  <AnimatePresence>
                    {openMenuPostId === post.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-9 z-30 w-44 rounded-2xl bg-background border border-border shadow-xl p-1.5 text-xs font-semibold space-y-0.5"
                      >
                        <button
                          onClick={() => {
                            handleShare(post.id);
                            setOpenMenuPostId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors cursor-pointer text-left"
                        >
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Copy link
                        </button>
                        <button
                          onClick={() => {
                            toggleSavePost(post.id);
                            setOpenMenuPostId(null);
                            toast.success(post.saved ? "Removed from bookmarks" : "Saved to bookmarks");
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors cursor-pointer text-left"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-muted-foreground" /> {post.saved ? "Unsave Post" : "Bookmark"}
                        </button>
                        {isAuthor && (
                          <button
                            onClick={() => {
                              deletePost(post.id);
                              setOpenMenuPostId(null);
                              toast.success("Post deleted successfully");
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete post
                          </button>
                        )}
                        {!isAuthor && (
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              toast.info("Thank you for flagging. Our campus safety team has been notified.");
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer text-left"
                          >
                            <Flag className="w-3.5 h-3.5" /> Report post
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Post Text Content */}
              <div>
                <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-wrap font-normal">
                  {post.content}
                </p>
                
                {/* Instagram Double-Tap Interactive Image Banner */}
                {post.image && (
                  <div 
                    onDoubleClick={() => handleDoubleTap(post)}
                    className="relative mt-4 rounded-2xl overflow-hidden border border-border/50 bg-secondary/20 select-none cursor-pointer group"
                  >
                    <img 
                      src={post.image} 
                      alt="Post attachment" 
                      className="w-full h-auto max-h-[460px] object-cover transition-transform duration-300 group-hover:scale-[1.01]" 
                    />

                    {/* Instagram Double-Tap Bouncing Heart Animation */}
                    <AnimatePresence>
                      {heartAnimPostId === post.id && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl"
                        >
                          <Heart className="w-24 h-24 text-rose-500 fill-rose-500 stroke-[2.5]" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                      Double tap to ❤️
                    </div>
                  </div>
                )}

                {/* Interactive Poll Component */}
                {post.type === "poll" && post.pollOptions && (
                  <div className="mt-4 rounded-2xl border border-border/50 p-4 space-y-2.5 bg-secondary/10">
                    <div className="flex items-center justify-between text-xs text-primary font-bold mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" /> Campus Poll
                      </div>
                      <span className="text-muted-foreground font-normal">{totalPollVotes} votes</span>
                    </div>

                    {post.pollOptions.map((opt) => {
                      const isVoted = post.votedOption === opt.option;
                      const percentage = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;

                      return (
                        <button
                          key={opt.option}
                          onClick={() => handleVote(post.id, opt.option)}
                          className={cn(
                            "relative w-full text-left p-3 rounded-xl border transition-all cursor-pointer overflow-hidden group",
                            isVoted 
                              ? "border-primary bg-primary/10 shadow-xs" 
                              : "border-border/60 bg-card hover:bg-secondary/40"
                          )}
                        >
                          {/* Percentage progress bar fill */}
                          <div 
                            className={cn(
                              "absolute inset-y-0 left-0 transition-all duration-500 pointer-events-none",
                              isVoted ? "bg-primary/20" : "bg-secondary/50"
                            )}
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between text-xs font-semibold">
                            <span className={cn(isVoted ? "text-primary font-bold" : "text-foreground")}>
                              {opt.option}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-muted-foreground font-mono">{percentage}%</span>
                              {isVoted && <Check className="w-3.5 h-3.5 text-primary" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hashtags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/40 text-xs font-semibold text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Instagram / Social Actions Bar */}
              <div className="flex items-center justify-between pt-3.5 border-t border-border/40 text-muted-foreground">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button 
                    onClick={() => toggleLikePost(post.id)}
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-2 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer rounded-xl h-9",
                      post.liked ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10 font-bold" : "text-muted-foreground"
                    )}
                  >
                    <Heart className={cn("w-4 h-4 transition-transform active:scale-125", post.liked && "fill-current text-rose-500")} />
                    <span>{post.likes}</span>
                  </Button>

                  <Button 
                    onClick={() => toggleCommentsDrawer(post.id)} 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-2 hover:text-primary hover:bg-primary/10 cursor-pointer rounded-xl h-9",
                      isCommentsOpen ? "text-primary bg-primary/10 font-bold" : "text-muted-foreground"
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </Button>

                  <Button 
                    onClick={() => handleShare(post.id)} 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer rounded-xl h-9"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>

                <Button 
                  onClick={() => {
                    toggleSavePost(post.id);
                    toast.success(post.saved ? "Removed from saved bookmarks" : "Post saved to your bookmarks! 🔖");
                  }}
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-9 w-9 hover:text-primary hover:bg-primary/10 cursor-pointer rounded-xl",
                    post.saved ? "text-primary bg-primary/10" : "text-muted-foreground"
                  )}
                  title={post.saved ? "Remove bookmark" : "Save post"}
                >
                  <Bookmark className={cn("w-4 h-4", post.saved && "fill-current")} />
                </Button>
              </div>

              {/* Instagram-Style Expandable Comments Section */}
              <AnimatePresence>
                {isCommentsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-border/40 space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {postComments.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-3 text-center bg-secondary/20 rounded-2xl">
                          No comments yet. Be the first to start the conversation! 💬
                        </p>
                      ) : (
                        postComments.map((c) => (
                          <div key={c.id} className="p-3 rounded-2xl bg-secondary/30 border border-border/40 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">{c.author}</span>
                                {c.author === user.name && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">You</span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground">{c.time}</span>
                            </div>
                            <p className="text-foreground/90 font-normal leading-relaxed">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder="Write a comment..."
                          className="w-full px-4 py-2.5 rounded-xl bg-card border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                          onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                        />
                      </div>
                      <Button 
                        onClick={() => handleAddComment(post.id)}
                        size="sm"
                        disabled={!commentInputs[post.id]?.trim()}
                        className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
}

export default CampusPostFeed;
