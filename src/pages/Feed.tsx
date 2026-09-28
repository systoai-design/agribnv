import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  Bell, 
  SlidersHorizontal, 
  Search, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Compass, 
  Home, 
  ShoppingBag, 
  User, 
  PlusCircle, 
  Check, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import haptics from '@/utils/haptics';

interface FeedPost {
  id: string;
  farmerName: string;
  farmerHandle: string;
  farmerAvatar: string;
  location: string;
  timeAgo: string;
  mediaUrl: string;
  caption: string;
  pillarTag: {
    type: 'stay' | 'experience' | 'product';
    label: string;
    detail: string;
    link: string;
  };
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
}

const MOCK_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    farmerName: 'Amadeo Heritage Coffee',
    farmerHandle: 'amadeocoffee',
    farmerAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=240&q=80',
    location: 'Amadeo, Cavite',
    timeAgo: '2h ago',
    mediaUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    caption: 'Morning mist rolling across our shade-grown Robusta blocks today. Coffee berry harvest begins in three weeks! We are opening up 4 weekend harvest tour slots for travelers.',
    pillarTag: {
      type: 'stay',
      label: 'Tagged Farm Stay',
      detail: 'Robusta Treehouse Suite • ₱2,800/night',
      link: '/farm-profile-preview'
    },
    likes: 142,
    comments: 18,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
  },
  {
    id: 'post-2',
    farmerName: 'Guimaras Sunburst Orchards',
    farmerHandle: 'guimarasorchards',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    location: 'Jordan, Guimaras',
    timeAgo: '5h ago',
    mediaUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80',
    caption: 'Sweetest Carabao harvest batch of the year is officially in! Hand-picked under early morning shade to lock in natural Brix sweetness. Fresh crates ready for pickup and farm visitors.',
    pillarTag: {
      type: 'experience',
      label: 'Tagged Experience',
      detail: 'Sweet Mango Picking & Jam Workshop • ₱650/pax',
      link: '/farm-profile-preview'
    },
    likes: 298,
    comments: 32,
    isLiked: true,
    isSaved: true,
    isFollowing: true,
  },
  {
    id: 'post-3',
    farmerName: 'Bukidnon Highland Honey Apiary',
    farmerHandle: 'bukidnonapiary',
    farmerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
    location: 'Impasugong, Bukidnon',
    timeAgo: '1d ago',
    mediaUrl: 'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=1200&q=80',
    caption: 'Harvesting wild mountain blossom nectar following the monsoon rains. Pure, raw Apis dorsata honey straight from our cliff hives into glass jars without chemical heating.',
    pillarTag: {
      type: 'product',
      label: 'Tagged Farm Product',
      detail: 'Pure Raw Highland Honey (350ml) • ₱480',
      link: '/farm-profile-preview'
    },
    likes: 412,
    comments: 49,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
  }
];

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<FeedPost[]>(MOCK_POSTS);

  const handleLike = (id: string) => {
    haptics.impact();
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likes: isLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleSave = (id: string) => {
    haptics.selection();
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isSaved = !post.isSaved;
        toast({
          title: isSaved ? "Saved to Farmland Wishlist" : "Removed from Wishlist",
          description: isSaved ? `Added ${post.farmerName}'s update to your saved stories.` : undefined
        });
        return { ...post, isSaved };
      }
      return post;
    }));
  };

  const handleFollow = (id: string) => {
    haptics.impact();
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const isFollowing = !post.isFollowing;
        toast({
          title: isFollowing ? `Following ${post.farmerName}` : `Unfollowed ${post.farmerName}`,
          description: isFollowing ? "You will see their harvest stories in your Following feed." : undefined
        });
        return { ...post, isFollowing };
      }
      return post;
    }));
  };

  const handleShare = (post: FeedPost) => {
    haptics.selection();
    if (navigator.share) {
      navigator.share({
        title: post.farmerName,
        text: post.caption,
        url: window.location.href,
      }).catch(() => {});
    } else {
      toast({
        title: "Link Copied",
        description: `Farm story link from ${post.farmerName} copied to clipboard.`
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'following' && !post.isFollowing) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.farmerName.toLowerCase().includes(q) ||
      post.location.toLowerCase().includes(q) ||
      post.caption.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-foreground flex flex-col pb-24 select-none">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-border/40 px-4 pt-3 pb-2.5 safe-area-pt">
        <div className="flex items-center justify-between">
          {/* Top Left: Map View & Notifications */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                haptics.selection();
                navigate('/map');
              }}
              aria-label="Map View"
              className="w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground/80 transition-colors"
            >
              <Map className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                haptics.selection();
                toast({ title: "Notifications", description: "No new harvest alerts at this time." });
              }}
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground/80 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-[#FDFBF7]" />
            </button>
          </div>

          {/* Center: UMANI Brand Logo */}
          <div 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 cursor-pointer py-1"
          >
            <span className="font-serif text-2xl font-bold tracking-tight text-[#224229]">
              UMANI
            </span>
          </div>

          {/* Top Right: User Profile Avatar */}
          <button
            onClick={() => {
              haptics.selection();
              navigate('/profile');
            }}
            aria-label="My Profile"
            className="w-10 h-10 rounded-full overflow-hidden border border-border/80 shadow-xs hover:ring-2 hover:ring-primary/40 transition-all flex items-center justify-center bg-secondary"
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
              alt="My Avatar"
              className="w-full h-full object-cover" 
            />
          </button>
        </div>

        {/* Secondary Bar: Switch Tab + Search + Filter */}
        <div className="mt-3 flex items-center gap-2">
          {/* Switch Tab Pill */}
          <div className="flex p-0.5 bg-secondary/70 rounded-full border border-border/50 shrink-0">
            <button
              onClick={() => {
                haptics.selection();
                setActiveTab('discover');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === 'discover'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => {
                haptics.selection();
                setActiveTab('following');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                activeTab === 'following'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Following
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search farms, crops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-secondary/50 rounded-full border border-border/60 focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => {
              haptics.selection();
              toast({ title: "Filters", description: "Filter by region, organic certification, and crop type." });
            }}
            aria-label="Filter Feed"
            className="w-9 h-9 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center text-foreground hover:bg-secondary shrink-0 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Feed Content Stream */}
      <main className="max-w-lg mx-auto w-full px-2 sm:px-4 pt-3 space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-foreground">No farm stories found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              {activeTab === 'following' 
                ? "You haven't followed any farms yet. Switch to 'Discover' to explore farmland reels!"
                : "Try a different search keyword like 'Coffee', 'Mango', or 'Cavite'."}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article 
              key={post.id} 
              className="bg-card rounded-2xl border border-border/60 shadow-xs overflow-hidden transition-all"
            >
              {/* Post Header: Farmer Info & Follow Button */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div 
                  onClick={() => navigate('/farm-profile-preview')}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <img
                    src={post.farmerAvatar}
                    alt={post.farmerName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-border group-hover:ring-primary/60 transition-all"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                        {post.farmerName}
                      </h4>
                      <span className="text-[10px] text-muted-foreground">@{post.farmerHandle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>{post.location}</span>
                      <span>•</span>
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => handleFollow(post.id)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                    post.isFollowing
                      ? 'bg-secondary text-foreground hover:bg-secondary/80'
                      : 'bg-primary text-white hover:bg-primary/90 shadow-2xs'
                  }`}
                >
                  {post.isFollowing ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      Following
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3 h-3" />
                      Follow
                    </>
                  )}
                </button>
              </div>

              {/* Media Container: Authentic Photo Card */}
              <div 
                onClick={() => navigate('/farm-profile-preview')}
                className="relative aspect-4/5 w-full bg-muted overflow-hidden cursor-pointer group"
              >
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />

                {/* Tagged Pillar Badge (Bottom Overlay of Photo) */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <div className="bg-[#1C2C20]/85 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 text-white flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-600/90 text-white shrink-0">
                        {post.pillarTag.type === 'stay' ? 'Farm Stay' : post.pillarTag.type === 'experience' ? 'Experience' : 'Produce'}
                      </span>
                      <span className="text-xs font-medium truncate">
                        {post.pillarTag.detail}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Engagement & Action Row */}
              <div className="p-3 sm:p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Like */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 text-xs text-foreground/80 hover:text-red-500 transition-colors"
                      aria-label="Like post"
                    >
                      <Heart 
                        className={`w-5 h-5 transition-transform active:scale-125 ${
                          post.isLiked ? 'fill-red-500 text-red-500' : ''
                        }`} 
                      />
                      <span className="font-semibold text-xs">{post.likes}</span>
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() => {
                        haptics.selection();
                        toast({ title: "Comments", description: `${post.comments} traveler inquiries on this harvest.` });
                      }}
                      className="flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition-colors"
                      aria-label="View comments"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold text-xs">{post.comments}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(post)}
                      className="text-foreground/80 hover:text-primary transition-colors"
                      aria-label="Share post"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bookmark / Wishlist */}
                  <button
                    onClick={() => handleSave(post.id)}
                    className="text-foreground/80 hover:text-primary transition-colors"
                    aria-label="Save to Wishlist"
                  >
                    <Bookmark 
                      className={`w-5 h-5 transition-transform active:scale-125 ${
                        post.isSaved ? 'fill-emerald-800 text-emerald-800' : ''
                      }`} 
                    />
                  </button>
                </div>

                {/* Caption & Story Description */}
                <p className="text-xs leading-relaxed text-foreground/90">
                  <span 
                    onClick={() => navigate('/farm-profile-preview')}
                    className="font-semibold cursor-pointer hover:underline mr-1.5"
                  >
                    {post.farmerHandle}
                  </span>
                  {post.caption}
                </p>

                {/* Farm Profile Quick-Jump Link */}
                <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <button 
                    onClick={() => navigate('/farm-profile-preview')}
                    className="flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E09F5A]" />
                    <span>View {post.farmerName} digital profile</span>
                  </button>
                  <span>Verified Farmland</span>
                </div>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Wireframe Navigation Bar matching user's spec:
          5 items with elevated center action button */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-xl border-t border-border/50 safe-area-pb">
        <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-3">
          {/* 1. Feed (Active) */}
          <button
            onClick={() => {
              haptics.selection();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 text-primary"
          >
            <Compass className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-primary">Feed</span>
          </button>

          {/* 2. Explore / Map */}
          <button
            onClick={() => {
              haptics.selection();
              navigate('/explore');
            }}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground"
          >
            <Map className="w-5 h-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </button>

          {/* 3. Center Elevated Action (Farmer Onboarding / Bookings) */}
          <button
            onClick={() => {
              haptics.impact();
              navigate('/farm-profile-preview');
            }}
            aria-label="Featured Farm Profile"
            className="w-11 h-11 -mt-4 rounded-full bg-[#1C2C20] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5 text-[#E09F5A]" />
          </button>

          {/* 4. Products / Harvests */}
          <button
            onClick={() => {
              haptics.selection();
              navigate('/products');
            }}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-medium">Harvests</span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => {
              haptics.selection();
              navigate('/profile');
            }}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
