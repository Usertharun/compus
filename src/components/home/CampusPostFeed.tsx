import { useState } from "react";
import { MessageSquare, Heart, Share2, Bookmark, MoreHorizontal, FileText, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Post {
  id: number;
  author: { name: string; avatar: string; title: string };
  timestamp: string;
  content: string;
  image: string | null;
  tags: string[];
  likes: number;
  comments: number;
  type: string;
  liked: boolean;
  saved: boolean;
  votedOption?: string | null;
}

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: { name: "Alex Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", title: "CS, Junior" },
    timestamp: "2 hours ago",
    content: "Just finished building my first full-stack app using Next.js and Supabase! It was a steep learning curve but completely worth it. Anyone else working on similar stack for their capstone?",
    image: null,
    tags: ["nextjs", "supabase", "webdev"],
    likes: 24,
    comments: 5,
    type: "text",
    liked: false,
    saved: false,
  },
  {
    id: 2,
    author: { name: "Design Club", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Design", title: "Official Community" },
    timestamp: "5 hours ago",
    content: "Sneak peek of the new UI components we're working on for the campus portal redesign. What do you think of this color scheme?",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
    tags: ["uiux", "design", "figma"],
    likes: 156,
    comments: 32,
    type: "image",
    liked: true,
    saved: true,
  },
  {
    id: 3,
    author: { name: "Sarah Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", title: "Marketing, Senior" },
    timestamp: "1 day ago",
    content: "Which email marketing platform do you prefer for student orgs?",
    image: null,
    tags: ["marketing", "tools"],
    likes: 12,
    comments: 45,
    type: "poll",
    liked: false,
    saved: false,
    votedOption: null,
  }
];

export function CampusPostFeed() {
  const [posts, setPosts] = useState(INITIAL_POSTS);

  const toggleLike = (id: number) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const toggleSave = (id: number) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return { ...post, saved: !post.saved };
      }
      return post;
    }));
  };

  const votePoll = (postId: number, option: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, votedOption: option };
      }
      return post;
    }));
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {posts.map((post) => (
        <div key={post.id} className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 space-y-4 transition-shadow hover:shadow-md">
          {/* Author Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3 items-center">
              <img src={post.author.avatar} alt={post.author.name} className="w-11 h-11 rounded-full object-cover border border-border shadow-sm" />
              <div>
                <h4 className="font-semibold text-sm text-foreground hover:underline cursor-pointer">{post.author.name}</h4>
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
                  <BarChart2 className="w-4 h-4" /> Poll
                </div>
                {['Mailchimp', 'Substack', 'ConvertKit', 'Other'].map(option => {
                  const isVoted = post.votedOption === option;
                  return (
                    <Button 
                      key={option} 
                      onClick={() => votePoll(post.id, option)}
                      variant={isVoted ? "default" : "outline"} 
                      className="w-full justify-start h-10 bg-card transition-all"
                    >
                      {option}
                      {isVoted && <span className="ml-auto text-xs">Voted</span>}
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
                onClick={() => toggleLike(post.id)}
                variant="ghost" 
                size="sm" 
                className={cn(
                  "gap-2 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10",
                  post.liked ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10" : "text-muted-foreground"
                )}
              >
                <Heart className={cn("w-4 h-4", post.liked && "fill-current")} />
                <span>{post.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments}</span>
              </Button>
              <Button onClick={() => alert('Link copied to clipboard!')} variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
            <Button 
              onClick={() => toggleSave(post.id)}
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-9 w-9 hover:text-primary hover:bg-primary/10",
                post.saved ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <Bookmark className={cn("w-4 h-4", post.saved && "fill-current")} />
            </Button>
          </div>
        </div>
      ))}

      {/* Infinite Scroll Loading Skeleton Stub */}
      <div className="flex justify-center py-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
