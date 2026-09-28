import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  MoreHorizontal, 
  MessageSquare, 
  Plus, 
  Check, 
  Sparkles, 
  Tag, 
  Film, 
  Home, 
  Compass, 
  MapPin, 
  Award, 
  Calendar, 
  Clock,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import haptics from '@/utils/haptics';

type TabCategory = 'offers' | 'stories' | 'stays' | 'experiences';

interface GridItem {
  id: string;
  category: TabCategory;
  title: string;
  priceOrTag: string;
  imageUrl: string;
  description: string;
}

const MOCK_GRID_ITEMS: GridItem[] = [
  // Offers
  {
    id: 'off-1',
    category: 'offers',
    title: 'Heirloom Harvest CSA Crate',
    priceOrTag: '₱1,200',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: 'Weekly farm box featuring 500g freshly roasted Robusta beans, 1kg seasonal rambutan, and pure mountain honey.'
  },
  {
    id: 'off-2',
    category: 'offers',
    title: 'Weekend Stay & Cupping Bundle',
    priceOrTag: '20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    description: 'Book 2 nights in the Robusta Treehouse and receive complimentary coffee cupping and sunrise orchard tour for two.'
  },
  {
    id: 'off-3',
    category: 'offers',
    title: 'Green Bean Bulk Sack (5kg)',
    priceOrTag: '₱2,400',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
    description: 'Direct-trade unroasted green coffee cherries for home roasters and specialty micro-cafes.'
  },

  // Stories
  {
    id: 'st-1',
    category: 'stories',
    title: 'Pruning Shade Trees',
    priceOrTag: 'Reel',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    description: 'Morning maintenance: thinning the madre de cacao canopy so morning sun reaches blossoming coffee trees.'
  },
  {
    id: 'st-2',
    category: 'stories',
    title: 'First Ripe Robusta Cherries',
    priceOrTag: 'Story',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'The first crimson cherries turning ruby red along the southern ridge blocks.'
  },
  {
    id: 'st-3',
    category: 'stories',
    title: 'Spring Water Irrigation Day',
    priceOrTag: 'Reel',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    description: 'Diverting fresh cold mountain creek water through traditional rock terraces.'
  },
  {
    id: 'st-4',
    category: 'stories',
    title: 'Roasting Over Native Charcoal',
    priceOrTag: 'Story',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80',
    description: 'Wood-fire clay pot roasting with grandfather Mateo in the heritage outdoor kitchen.'
  },
  {
    id: 'st-5',
    category: 'stories',
    title: 'Rainy Afternoon Coffee Pavilion',
    priceOrTag: 'Story',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    description: 'Guests gathering for warm Robusta drip while monsoon showers roll down the valley.'
  },
  {
    id: 'st-6',
    category: 'stories',
    title: 'Wild Honeybee Nest on Ridge',
    priceOrTag: 'Reel',
    imageUrl: 'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=600&q=80',
    description: 'Native pukyutan bees pollinating the coffee blossoms this week.'
  },

  // Stays & Tours
  {
    id: 'sty-1',
    category: 'stays',
    title: 'Robusta Treehouse Suite',
    priceOrTag: '₱2,800/nt',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    description: 'Elevated bamboo sanctuary overlooking 12 hectares of canopy coffee trees. Includes private deck and breakfast.'
  },
  {
    id: 'sty-2',
    category: 'stays',
    title: 'Heritage Kubo Cottage',
    priceOrTag: '₱1,950/nt',
    imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional hardwood and nipa cottage equipped with modern en-suite bath and outdoor hammock lounge.'
  },
  {
    id: 'sty-3',
    category: 'stays',
    title: 'Guided Heritage Orchard Tour',
    priceOrTag: '₱350/pax',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69102353?auto=format&fit=crop&w=600&q=80',
    description: 'A 90-minute walk through 50-year-old Liberica mother trees guided by 3rd-generation farm family members.'
  },

  // Experiences
  {
    id: 'exp-1',
    category: 'experiences',
    title: 'Coffee Cherry Picking & Pulper Workshop',
    priceOrTag: '₱650/pax',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'Hand-pick ripe coffee berries, process them through antique hand-crank pulpers, and take home seeds.'
  },
  {
    id: 'exp-2',
    category: 'experiences',
    title: 'Artisan Clay Pot Roasting Class',
    priceOrTag: '₱850/pax',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80',
    description: 'Master manual wood-fire roasting techniques, sensory crack profiling, and pour-over brewing.'
  },
  {
    id: 'exp-3',
    category: 'experiences',
    title: 'Coffee Tree Grafting & Planting',
    priceOrTag: '₱500/pax',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
    description: 'Plant a tagged heirloom Robusta seedling with your family name that will grow on the estate.'
  }
];

export default function FarmPublicProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabCategory>('stories');
  const [selectedItem, setSelectedItem] = useState<GridItem | null>(null);

  const handleFollow = () => {
    haptics.impact();
    setIsFollowing(!isFollowing);
    toast({
      title: !isFollowing ? "Following Amadeo Heritage Coffee" : "Unfollowed Farm",
      description: !isFollowing ? "You'll see their harvest updates and seasonal offers in your feed." : undefined
    });
  };

  const handleMessage = () => {
    haptics.selection();
    toast({
      title: "Message Farm Host",
      description: "Direct host messaging window opened. Inquire about stays or custom harvest tours."
    });
  };

  const handleShare = () => {
    haptics.selection();
    if (navigator.share) {
      navigator.share({
        title: "Amadeo Heritage Coffee & Farmland",
        text: "Check out this 3rd-generation coffee estate on UMANI!",
        url: window.location.href,
      }).catch(() => {});
    } else {
      toast({
        title: "Link Copied",
        description: "Farm profile link copied to clipboard."
      });
    }
  };

  const currentTabItems = MOCK_GRID_ITEMS.filter(item => item.category === activeTab);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-foreground flex flex-col pb-20 select-none">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-border/40 px-4 py-2.5 flex items-center justify-between safe-area-pt">
        <button
          onClick={() => {
            haptics.selection();
            navigate(-1);
          }}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-foreground transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="font-semibold text-xs tracking-tight text-foreground/80">
          @amadeocoffee
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
            aria-label="Share Farm Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast({ title: "Options", description: "Report profile or view compliance certificates." })}
            className="w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
            aria-label="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Cover Banner & Avatar */}
      <div className="relative">
        {/* Cover Banner */}
        <div className="w-full h-44 sm:h-52 bg-muted overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"
            alt="Amadeo Farmland Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Circular Farm Avatar (Centered Overlapping Banner) */}
        <div className="relative -mt-14 flex justify-center">
          <div className="w-24 h-24 rounded-full p-1 bg-[#FDFBF7] shadow-md ring-2 ring-primary/20">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=240&q=80"
              alt="Farmer Mateo Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Farm Name, Handle & Location */}
      <div className="text-center px-4 pt-2">
        <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Amadeo Heritage Coffee Estate
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Amadeo, Cavite • 3rd-Gen Robusta & Liberica</span>
        </p>

        {/* 2 Action Buttons Side-by-Side */}
        <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto mt-4">
          {/* Follow Button */}
          <button
            onClick={handleFollow}
            className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              isFollowing
                ? 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                : 'bg-primary text-white hover:bg-primary/95'
            }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Following Farm
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Follow Farm
              </>
            )}
          </button>

          {/* Message Farmer Button */}
          <button
            onClick={handleMessage}
            className="py-2 px-4 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            Message Farmer
          </button>
        </div>

        {/* Rounded Terroir & Farm Highlight Card */}
        <div className="max-w-md mx-auto mt-4 p-3.5 rounded-2xl bg-[#F6F1E8]/70 border border-[#E5DECF] text-left shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Organic Terroir
            </span>
            <span className="text-[10px] text-muted-foreground">
              Est. 1974 • 12 Hectares
            </span>
          </div>
          <p className="text-xs text-foreground/85 leading-relaxed">
            Rich volcanic loam at 450m altitude with natural spring-fed gravity irrigation. Dedicated to preserving Philippine heirloom Robusta through regenerative agroforestry.
          </p>
          <div className="mt-2.5 pt-2 border-t border-[#E5DECF]/80 flex flex-wrap gap-2 text-[10px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-[#E09F5A]" /> GAP Certified
            </span>
            <span>•</span>
            <span>Shade-Grown Canopy</span>
            <span>•</span>
            <span>Working Apiary</span>
          </div>
        </div>

        {/* 4 Circular Category Tabs (Specified by User):
            1. Offers  2. Stories  3. Stays & Tours  4. Experiences */}
        <div className="max-w-md mx-auto mt-6">
          <div className="flex items-center justify-around px-2">
            {/* Tab 1: Offers */}
            <button
              onClick={() => {
                haptics.selection();
                setActiveTab('offers');
              }}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'offers'
                  ? 'bg-primary text-white shadow-md ring-3 ring-primary/20'
                  : 'bg-secondary text-muted-foreground group-hover:text-foreground'
              }`}>
                <Tag className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-semibold transition-colors ${
                activeTab === 'offers' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Offers
              </span>
            </button>

            {/* Tab 2: Stories */}
            <button
              onClick={() => {
                haptics.selection();
                setActiveTab('stories');
              }}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'stories'
                  ? 'bg-primary text-white shadow-md ring-3 ring-primary/20'
                  : 'bg-secondary text-muted-foreground group-hover:text-foreground'
              }`}>
                <Film className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-semibold transition-colors ${
                activeTab === 'stories' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Stories
              </span>
            </button>

            {/* Tab 3: Stays & Tours */}
            <button
              onClick={() => {
                haptics.selection();
                setActiveTab('stays');
              }}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'stays'
                  ? 'bg-primary text-white shadow-md ring-3 ring-primary/20'
                  : 'bg-secondary text-muted-foreground group-hover:text-foreground'
              }`}>
                <Home className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-semibold transition-colors ${
                activeTab === 'stays' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Stays & Tours
              </span>
            </button>

            {/* Tab 4: Experiences */}
            <button
              onClick={() => {
                haptics.selection();
                setActiveTab('experiences');
              }}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'experiences'
                  ? 'bg-primary text-white shadow-md ring-3 ring-primary/20'
                  : 'bg-secondary text-muted-foreground group-hover:text-foreground'
              }`}>
                <Compass className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-semibold transition-colors ${
                activeTab === 'experiences' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Experiences
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Media Grid (Matching wireframe layout) */}
      <section className="max-w-md mx-auto w-full px-2 sm:px-3 mt-5">
        <div className="grid grid-cols-3 gap-1.5">
          {currentTabItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                haptics.selection();
                setSelectedItem(item);
              }}
              className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer group shadow-2xs"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                <span className="text-[9px] font-bold px-1 py-0.5 bg-black/50 rounded-xs backdrop-blur-xs">
                  {item.priceOrTag}
                </span>
                <p className="text-[10px] font-medium leading-tight truncate mt-1">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Item Detail Sheet / Modal when clicking grid item */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FDFBF7] w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="relative aspect-video w-full bg-muted">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3">
                <span className="text-xs font-bold px-2 py-1 rounded-sm bg-primary text-white">
                  {selectedItem.priceOrTag}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {selectedItem.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedItem.description}
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    haptics.impact();
                    toast({
                      title: "Inquiry Sent to Farmer",
                      description: `Interested in ${selectedItem.title}. Farmer Mateo will respond directly.`
                    });
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-all shadow-xs"
                >
                  Book / Inquire Now
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="py-2.5 px-4 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
