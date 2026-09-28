import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  MoreHorizontal, 
  MessageSquare, 
  Plus, 
  Check, 
  Tag, 
  Film, 
  Home, 
  Compass, 
  MapPin, 
  Award, 
  X,
  LayoutGrid
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
  {
    id: 'off-4',
    category: 'offers',
    title: 'Pure Forest Wildflower Honey',
    priceOrTag: '₱450',
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80',
    description: 'Raw, unpasteurized honey harvested from native pukyutan bees nesting near coffee blossoms.'
  },
  {
    id: 'off-5',
    category: 'offers',
    title: 'Single-Origin Robusta Cold Brew',
    priceOrTag: '₱180',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    description: '18-hour cold steeped heirloom Robusta with natural hints of cacao nibs and toasted hazelnut.'
  },
  {
    id: 'off-6',
    category: 'offers',
    title: 'Farm Kitchen Table Reserve Box',
    priceOrTag: '₱850',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    description: 'Pre-order harvest lunch basket with wood-smoked native chicken and heirloom red rice.'
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
  {
    id: 'sty-4',
    category: 'stays',
    title: 'Canopy Glamping Safari Bell Tent',
    priceOrTag: '₱2,200/nt',
    imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
    description: 'Luxury canvas tent nestled among flowering shade trees with stargazing firepit.'
  },
  {
    id: 'sty-5',
    category: 'stays',
    title: 'Sunrise Ridge View Deck Hut',
    priceOrTag: '₱1,650/nt',
    imageUrl: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=80',
    description: 'Panoramic views of Mt. Sungay and misty Cavite valleys with outdoor pour-over bar.'
  },
  {
    id: 'sty-6',
    category: 'stays',
    title: 'Sunset Coffee Orchard Walk',
    priceOrTag: '₱400/pax',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'Golden hour walk concluding with fresh drip coffee and local rice cakes at the ridge lookout.'
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
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    description: 'Plant a tagged heirloom Robusta seedling with your family name that will grow on the estate.'
  },
  {
    id: 'exp-4',
    category: 'experiences',
    title: 'Honey Harvesting & Hive Inspection',
    priceOrTag: '₱750/pax',
    imageUrl: 'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=600&q=80',
    description: 'Suit up with our beekeeper to inspect stingless native bee hives and sample fresh comb.'
  },
  {
    id: 'exp-5',
    category: 'experiences',
    title: 'Farm Kitchen Cupping & Table Lunch',
    priceOrTag: '₱950/pax',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    description: 'Sensory coffee cupping flight followed by a 3-course organic harvest meal in the open-air pavilion.'
  },
  {
    id: 'exp-6',
    category: 'experiences',
    title: 'Traditional Bamboo Craft & Trellis Workshop',
    priceOrTag: '₱450/pax',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    description: 'Learn sustainable bamboo joining and weave simple plant supports with estate artisans.'
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
    <div className="min-h-screen bg-[#FDFBF7] text-foreground flex flex-col pb-16 select-none">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-border/40 px-3 py-2 flex items-center justify-between safe-area-pt">
        <button
          onClick={() => {
            haptics.selection();
            navigate(-1);
          }}
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-foreground transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1 font-semibold text-xs tracking-tight text-foreground/90">
          <span>@amadeocoffee</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
            aria-label="Share Farm Profile"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toast({ title: "Options", description: "Report profile or view compliance certificates." })}
            className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
            aria-label="More Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Cover Banner & Avatar */}
      <div className="relative">
        {/* Cover Banner */}
        <div className="w-full h-36 sm:h-44 bg-muted overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"
            alt="Amadeo Farmland Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Circular Farm Avatar (Centered Overlapping Banner) */}
        <div className="relative -mt-10 flex justify-center">
          <div className="w-20 h-20 rounded-full p-0.5 bg-[#FDFBF7] shadow-sm ring-2 ring-[#FDFBF7]">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=240&q=80"
              alt="Farmer Mateo Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Farm Name, Location & Stats */}
      <div className="text-center px-4 pt-1.5">
        <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Amadeo Heritage Coffee Estate
        </h1>
        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3 text-primary shrink-0" />
          <span>Amadeo, Cavite • 3rd-Gen Robusta & Liberica</span>
        </p>

        {/* Instagram Profile Stats Row */}
        <div className="flex items-center justify-center gap-6 mt-2.5 py-1 text-center">
          <div>
            <span className="block text-xs font-bold text-foreground">18</span>
            <span className="block text-[10px] text-muted-foreground">Stories</span>
          </div>
          <div className="w-px h-5 bg-border/60" />
          <div>
            <span className="block text-xs font-bold text-foreground">1.4k</span>
            <span className="block text-[10px] text-muted-foreground">Followers</span>
          </div>
          <div className="w-px h-5 bg-border/60" />
          <div>
            <span className="block text-xs font-bold text-foreground">12 ha</span>
            <span className="block text-[10px] text-muted-foreground">Farmland</span>
          </div>
          <div className="w-px h-5 bg-border/60" />
          <div>
            <span className="block text-xs font-bold text-foreground">4.9 ★</span>
            <span className="block text-[10px] text-muted-foreground">94 Reviews</span>
          </div>
        </div>

        {/* Compact Instagram-Style Action Buttons (Sleek h-8) */}
        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mt-2.5">
          {/* Follow Button */}
          <button
            onClick={handleFollow}
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs ${
              isFollowing
                ? 'bg-[#F3EFE6] text-[#1E3A2B] hover:bg-[#E8E2D5] border border-[#DDD5C5]'
                : 'bg-[#1E3A2B] text-white hover:bg-[#1E3A2B]/90'
            }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Following
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Follow Farm
              </>
            )}
          </button>

          {/* Message Farmer Button */}
          <button
            onClick={handleMessage}
            className="h-8 px-3 rounded-lg text-xs font-semibold bg-[#F3EFE6] hover:bg-[#E8E2D5] text-[#1E3A2B] border border-[#DDD5C5] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#1E3A2B]" />
            Message
          </button>
        </div>

        {/* Compact Terroir & Farm Highlight Card */}
        <div className="max-w-md mx-auto mt-3 px-3 py-2 rounded-lg bg-[#F6F1E8]/70 border border-[#E5DECF]/80 text-left shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">
              Organic Terroir
            </span>
            <span className="text-[10px] text-muted-foreground">
              Est. 1974 • 12 Hectares
            </span>
          </div>
          <p className="text-[11px] text-foreground/80 leading-snug">
            Rich volcanic loam at 450m altitude with natural spring-fed gravity irrigation. Dedicated to preserving Philippine heirloom Robusta through regenerative agroforestry.
          </p>
          <div className="mt-1.5 pt-1.5 border-t border-[#E5DECF]/70 flex flex-wrap gap-2 text-[10px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-[#E09F5A]" /> GAP Certified
            </span>
            <span>•</span>
            <span>Shade-Grown Canopy</span>
            <span>•</span>
            <span>Working Apiary</span>
          </div>
        </div>
      </div>

      {/* Instagram Profile Grid Tabs Bar (Sharp lines, active indicator) */}
      <div className="max-w-md mx-auto w-full mt-3 border-t border-border/50 grid grid-cols-4 text-center">
        <button
          onClick={() => {
            haptics.selection();
            setActiveTab('stories');
          }}
          className={`py-2.5 flex items-center justify-center border-b-2 transition-colors ${
            activeTab === 'stories' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Stories and Reels Tab"
        >
          <Film className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            haptics.selection();
            setActiveTab('offers');
          }}
          className={`py-2 flex items-center justify-center border-b-2 transition-colors ${
            activeTab === 'offers' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Offers Tab"
        >
          <Tag className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            haptics.selection();
            setActiveTab('stays');
          }}
          className={`py-2 flex items-center justify-center border-b-2 transition-colors ${
            activeTab === 'stays' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Stays and Tours Tab"
        >
          <Home className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            haptics.selection();
            setActiveTab('experiences');
          }}
          className={`py-2 flex items-center justify-center border-b-2 transition-colors ${
            activeTab === 'experiences' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Experiences Tab"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Instagram-Style Media Grid:
          - Strictly NO rounded corners (rounded-none)
          - 3 columns with 1.5px hairline gap
          - Square photos (aspect-square)
          - Subtle corner indicators (Reels icon, price tag) */}
      <section className="max-w-md mx-auto w-full">
        <div className="grid grid-cols-3 gap-[1.5px] bg-[#E5DECF]/50">
          {currentTabItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                haptics.selection();
                setSelectedItem(item);
              }}
              className="relative aspect-square bg-muted rounded-none overflow-hidden cursor-pointer group"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover rounded-none transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />

              {/* Instagram Reel Icon in Top-Right Corner */}
              {item.priceOrTag === 'Reel' && (
                <div className="absolute top-1.5 right-1.5 pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] text-white">
                  <Film className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Price / Tag Badge in Bottom-Left Corner */}
              {item.priceOrTag !== 'Reel' && item.priceOrTag !== 'Story' && (
                <div className="absolute bottom-1 left-1 pointer-events-none">
                  <span className="text-[9px] font-bold px-1 py-0.5 bg-black/65 text-white rounded-none backdrop-blur-xs">
                    {item.priceOrTag}
                  </span>
                </div>
              )}

              {/* Subtle Instagram Hover/Tap Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-end p-1.5 pointer-events-none">
                <p className="text-[10px] text-white font-medium truncate leading-tight drop-shadow-sm">
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
          <div className="bg-[#FDFBF7] w-full max-w-md rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="relative aspect-video w-full bg-muted">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2.5 left-2.5">
                <span className="text-xs font-bold px-2 py-0.5 bg-[#1E3A2B] text-white rounded-sm">
                  {selectedItem.priceOrTag}
                </span>
              </div>
            </div>

            <div className="p-3.5 space-y-2.5">
              <h3 className="font-serif text-base font-bold text-foreground">
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
                  className="flex-1 h-9 rounded-lg bg-[#1E3A2B] text-white text-xs font-semibold hover:bg-[#1E3A2B]/90 transition-colors shadow-xs"
                >
                  Book / Inquire Now
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="h-9 px-3.5 rounded-lg bg-[#F3EFE6] text-[#1E3A2B] text-xs font-semibold hover:bg-[#E8E2D5] border border-[#DDD5C5] transition-colors"
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
