import { useState } from "react";
import { MessageSquare, Heart, Share2, Bookmark, MoreHorizontal, BarChart2, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";

export function CampusPostFeed() {
  const { posts, toggleLikePost, toggleSavePost, searchQuery, user } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [votedPolls, setVotedPolls] = useState<Record<string | number, string>>({});
  const [openComments, setOpenComments] = useState<Record<string | number, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string | number, Array<{ id: number; author: string; text: string; time: string }>>>({
    1: [
      { id: 101, author: "Sarah Jenkins", text: "Next.js + Supabase is an unbelievable stack! Make sure to check out RLS policies.", time: "1 hour ago" },
      { id: 102, author: "Marcus Kim", text: "Awesome project! Are you planning to deploy on Vercel?", time: "30 mins ago" }
    ],
    2: [
      { id: 201, author: "Alex Rivera", text: "Love the indigo dark mode palette!", time: "4 hours ago" }
    ]
  });
  const [commentInputs, setCommentInputs] = useState<Record<string | number, string>>({});

  const handleVote = (postId: string | number, option: string) => {
    setVotedPolls(prev => ({ ...prev, [postId]: option }));
    toast.success(`Voted for "${option}"`);
  };

  const handleShare = (postId: string | number) => {
    navigator.clipboard?.writeText?.(window.location.href);
    toast.success("Post link copied to clipboard!");
  };

  const toggleCommentsDrawer = (postId: string | number) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId: string | number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment = {
      id: Date.now(),
      author: user.name,
      text,
      time: "Just now"
    };

    setCommentsMap(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    toast.success("Comment added!");
  };

  // Filter posts based on global search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(q) ||
      post.author.name.toLowerCase().includes(q) ||
      post.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 pb-20">
      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground glass-panel rounded-3xl space-y-2">
          <p className="font-bold text-base text-foreground">No posts matching "{searchQuery}"</p>
          <p className="text-xs">Try searching for keywords like "nextjs", "design", or "marketing".</p>
        </div>
      ) : (
        filteredPosts.map((post) => {
          const selectedPollOption = votedPolls[post.id] || post.votedOption;
          const postComments = commentsMap[post.id] || [];
          const isCommentsOpen = openComments[post.id];

          return (
            <div key={post.id} className="glass-panel rounded-3xl p-5 space-y-4 transition-all duration-300 hover:shadow-xl">
              {/* Author Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 items-center cursor-pointer" onClick={() => navigate("/profile")}>
                  <img src={post.author.avatar} alt={post.author.name} className="w-11 h-11 rounded-full object-cover border border-border shadow-sm" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground hover:underline">{post.author.name}</h4>
                    <p className="text-[12px] text-muted-foreground">{post.author.title} • {post.timestamp}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div>
                <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                
                {/* Rich Previews */}
                {post.type === "image" && post.image && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
                    <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-[400px] object-cover" />
                  </div>
                )}

                {post.type === "poll" && (
                  <div className="mt-4 rounded-xl border border-border/50 p-4 space-y-3 bg-secondary/10">
                    <div className="flex items-center gap-2 text-primary font-medium mb-2">
                      <BarChart2 className="w-4 h-4" /> Campus Poll
                    </div>
                    {['Mailchimp', 'Substack', 'ConvertKit', 'Other'].map(option => {
                      const isVoted = selectedPollOption === option;
                      return (
                        <Button 
                          key={option} 
                          onClick={() => handleVote(post.id, option)}
                          variant={isVoted ? "default" : "outline"} 
                          className={cn(
                            "w-full justify-start h-10 transition-all cursor-pointer",
                            isVoted ? "bg-primary text-primary-foreground font-bold shadow-md" : "bg-card hover:bg-accent"
                          )}
                        >
                          {option}
                          {isVoted && (
                            <span className="ml-auto text-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Voted
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50 text-muted-foreground">
                <div className="flex items-center gap-1 sm:gap-4">
                  <Button 
                    onClick={() => toggleLikePost(post.id)}
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-2 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer",
                      post.liked ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10" : "text-muted-foreground"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", post.liked && "fill-current")} />
                    <span>{post.likes}</span>
                  </Button>
                  <Button 
                    onClick={() => toggleCommentsDrawer(post.id)} 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments + postComments.length}</span>
                  </Button>
                  <Button 
                    onClick={() => handleShare(post.id)} 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
                <Button 
                  onClick={() => {
                    toggleSavePost(post.id);
                    toast.success(post.saved ? "Removed from saved items" : "Post saved to your bookmarks!");
                  }}
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-9 w-9 hover:text-primary hover:bg-primary/10 cursor-pointer",
                    post.saved ? "text-primary bg-primary/10" : "text-muted-foreground"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", post.saved && "fill-current")} />
                </Button>
              </div>

              {/* Interactive Comments Section Drawer */}
              {isCommentsOpen && (
                <div className="pt-4 border-t border-border/40 space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {postComments.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 text-center">No comments yet. Start the conversation!</p>
                    ) : (
                      postComments.map((c) => (
                        <div key={c.id} className="p-3 rounded-2xl bg-secondary/30 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{c.author}</span>
                            <span className="text-[10px] text-muted-foreground">{c.time}</span>
                          </div>
                          <p className="text-muted-foreground">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Write a comment..."
                      className="flex-1 px-4 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                    />
                    <Button 
                      onClick={() => handleAddComment(post.id)}
                      size="sm"
                      className="h-9 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
