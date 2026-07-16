import { useState, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, ArrowRight, Search, SlidersHorizontal, Bell, ChevronLeft, MapPin } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { SampleProduct } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import ProductLocationCarousel from '@/components/products/ProductLocationCarousel';
import { ProductSearchModal } from '@/components/search/ProductSearchModal';
import { ListingTypeTabs } from '@/components/properties/ListingTypeTabs';
import { useEscapeKey } from '@/hooks/useEscapeKey';

const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'mangoes',
    name: 'Sweet Carabao Mangoes',
    emoji: '🥭',
    gradient: 'from-amber-300 via-yellow-300 to-orange-400',
    price: 350,
    unit: 'per kg',
    farm: 'Mango Heritage Farm',
    location: 'Jordan, Guimaras',
    category: 'Fresh Produce',
  },
  {
    id: 'honey',
    name: 'Raw Forest Honey',
    emoji: '🍯',
    gradient: 'from-amber-400 via-amber-500 to-orange-500',
    price: 450,
    unit: '500ml jar',
    farm: 'Palawan Bee Farm',
    location: 'Puerto Princesa',
    category: 'Preserves',
  },
  {
    id: 'milk',
    name: 'Fresh Carabao Milk',
    emoji: '🥛',
    gradient: 'from-slate-100 via-stone-200 to-neutral-300',
    price: 180,
    unit: 'per liter',
    farm: 'Lakbay Dairy Farm',
    location: 'Lipa, Batangas',
    category: 'Dairy',
  },
  {
    id: 'kesong-puti',
    name: 'Kesong Puti',
    emoji: '🧀',
    gradient: 'from-yellow-100 via-amber-100 to-yellow-200',
    price: 280,
    unit: '250g block',
    farm: 'Lakbay Dairy Farm',
    location: 'Lipa, Batangas',
    category: 'Dairy',
  },
  {
    id: 'veggies',
    name: 'Organic Highland Veggie Box',
    emoji: '🥬',
    gradient: 'from-lime-300 via-green-400 to-emerald-500',
    price: 650,
    unit: '5kg mix',
    farm: 'Baguio Strawberry Homestay',
    location: 'Baguio, Benguet',
    category: 'Fresh Produce',
  },
  {
    id: 'strawberries',
    name: 'Baguio Strawberries',
    emoji: '🍓',
    gradient: 'from-rose-300 via-red-400 to-rose-500',
    price: 420,
    unit: 'per kg',
    farm: 'Baguio Strawberry Homestay',
    location: 'Baguio, Benguet',
    category: 'Fresh Produce',
  },
  {
    id: 'coconut-oil',
    name: 'Virgin Coconut Oil',
    emoji: '🥥',
    gradient: 'from-stone-200 via-amber-100 to-stone-300',
    price: 320,
    unit: '500ml bottle',
    farm: 'Calauan Countryside',
    location: 'Calauan, Laguna',
    category: 'Preserves',
  },
  {
    id: 'eggs',
    name: 'Free-Range Farm Eggs',
    emoji: '🥚',
    gradient: 'from-amber-50 via-orange-100 to-amber-200',
    price: 180,
    unit: 'dozen',
    farm: 'Mango Heritage Farm',
    location: 'Jordan, Guimaras',
    category: 'Fresh Produce',
  },
  {
    id: 'coco-sugar',
    name: 'Organic Coco Sugar',
    emoji: '🧂',
    gradient: 'from-amber-600 via-orange-700 to-amber-800',
    price: 220,
    unit: '500g jar',
    farm: 'Pinto Highland Cottage',
    location: 'Tagaytay, Cavite',
    category: 'Preserves',
  },
  {
    id: 'basket',
    name: 'Handwoven Abaca Basket',
    emoji: '🧺',
    gradient: 'from-amber-700 via-orange-800 to-stone-700',
    price: 850,
    unit: 'each',
    farm: 'Bamboo Nipa Hut',
    location: 'Nueva Valencia, Guimaras',
    category: 'Crafts',
  },
  {
    id: 'rice',
    name: 'Heirloom Red Rice',
    emoji: '🌾',
    gradient: 'from-amber-500 via-red-400 to-rose-500',
    price: 280,
    unit: '2kg bag',
    farm: 'Carabao Countryside',
    location: 'Calauan, Laguna',
    category: 'Staples',
  },
  {
    id: 'dried-mangoes',
    name: 'Dried Mango Strips',
    emoji: '🥭',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    price: 180,
    unit: '150g pack',
    farm: 'Mango Heritage Farm',
    location: 'Jordan, Guimaras',
    category: 'Preserves',
  },
];

const CATEGORIES = Array.from(new Set(SAMPLE_PRODUCTS.map((p) => p.category)));

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [searchLocation, setSearchLocation] = useState('');
  const [appliedSearchLocation, setAppliedSearchLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 2000]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const locationCarouselsRef = useRef<HTMLDivElement>(null);

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    let filtered = SAMPLE_PRODUCTS;

    if (appliedSearchLocation) {
      const term = appliedSearchLocation.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.location.toLowerCase().includes(term) ||
        p.farm.toLowerCase().includes(term)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    filtered = filtered.filter(p => p.price >= appliedPriceRange[0] && p.price <= appliedPriceRange[1]);

    return filtered;
  }, [appliedSearchLocation, selectedCategories, appliedPriceRange]);

  const hasActiveFilters = Boolean(
    appliedSearchLocation || 
    selectedCategories.length > 0 || 
    appliedPriceRange[0] > 0 || 
    appliedPriceRange[1] < 2000
  );

  // Group products by location
  const productsByLocation = useMemo(() => {
    const groups: Record<string, SampleProduct[]> = {};
    SAMPLE_PRODUCTS.forEach((product) => {
      const city = product.location.split(',')[0].trim();
      if (!groups[city]) groups[city] = [];
      groups[city].push(product);
    });

    const sortedEntries = Object.entries(groups).sort((a, b) => {
      const countDiff = b[1].length - a[1].length;
      if (countDiff !== 0) return countDiff;
      return a[0].localeCompare(b[0]);
    });

    return Object.fromEntries(sortedEntries);
  }, []);

  const handleSearch = () => {
    setAppliedSearchLocation(searchLocation);
  };

  const applyFilters = () => {
    setAppliedPriceRange(priceRange);
    setIsFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchLocation('');
    setAppliedSearchLocation('');
    setSelectedCategories([]);
    setPriceRange([0, 2000]);
    setAppliedPriceRange([0, 2000]);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) && prev.length === 1
        ? []
        : [cat]
    );
  };

  const closeFilters = useCallback(() => setIsFiltersOpen(false), []);
  useEscapeKey(closeFilters, isFiltersOpen);

  return (
    <Layout
      searchLocation={searchLocation}
      onSearchLocationChange={setSearchLocation}
      onSearch={handleSearch}
    >
      {/* Mobile Simple Search Bar */}
      <div className="relative md:hidden px-4 safe-area-pt pb-3 flex items-center gap-2 animate-fade-in bg-card border-b border-border/30 sticky top-0 z-40">
        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className="flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-full bg-card border border-border/50 shadow-soft active:scale-[0.98] transition-transform"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground truncate">
            {appliedSearchLocation || 'Search products...'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setIsFiltersOpen(true)}
          aria-label="Filters"
          className="w-11 h-11 rounded-full bg-card border border-border/50 shadow-soft flex items-center justify-center active:scale-95 transition-transform shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 text-foreground" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="w-11 h-11 rounded-full bg-card border border-border/50 shadow-soft flex items-center justify-center active:scale-95 transition-transform shrink-0 relative"
        >
          <Bell className="h-4 w-4 text-foreground" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>
      </div>

      {/* Mobile Search Modal */}
      <ProductSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        location={searchLocation}
        onLocationChange={setSearchLocation}
        onSearch={handleSearch}
      />

      {/* Listing Type Tabs (Global Navigation between Stays/Experiences/Tours/Products) */}
      <div className="px-4 md:px-0 md:container py-2">
        <ListingTypeTabs
          selectedType={'products' as any}
          onTypeChange={(type) => {
            navigate(`/explore?type=${type}`);
          }}
        />
      </div>

      {/* Main Content */}
      <section className="container py-3 md:py-6">
        
        {/* Page Header (replaces the old static header) */}
        {!hasActiveFilters && (
          <div className="mb-6 md:mb-10 text-center md:text-left">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Coming Soon — Preview
            </motion.div>
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="font-display text-3xl md:text-4xl font-bold mb-2 text-foreground"
            >
              Farm Products
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto md:mx-0"
            >
              Shop fresh produce, preserves, dairy, and crafts direct from local
              farmers. The marketplace launches soon — here's a peek at what's
              coming.
            </motion.p>
          </div>
        )}

        {/* Dynamic Header & Clear Filters (only shows when filtering) */}
        <div className="flex items-center justify-between mb-3 md:mb-6 animate-fade-in">
          {hasActiveFilters && (
            <div>
              <h2 className="font-serif text-lg md:text-2xl font-bold text-foreground">
                Search Results
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredProducts.length} items found
              </p>
            </div>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-primary hover:text-primary/80 text-xs h-11 min-h-[44px]"
            >
              Clear filters
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            type="button"
            onClick={() => setSelectedCategories([])}
            className={cn(
              "shrink-0 min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-colors border",
              selectedCategories.length === 0
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border/50 hover:border-primary/50"
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={cn(
                "shrink-0 min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                selectedCategories.includes(cat)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border/50 hover:border-primary/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid or Categories */}
        {!hasActiveFilters ? (
          <div className="space-y-6 md:space-y-10">
            {/* Featured Grid (Shows top 8 items) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {SAMPLE_PRODUCTS.slice(0, 8).map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>

            {/* Location Carousels */}
            <div ref={locationCarouselsRef} className="space-y-6 md:space-y-10 scroll-mt-4 pt-4 border-t border-border/30">
              {Object.entries(productsByLocation).map(([location, props]) => (
                <ProductLocationCarousel
                  key={location}
                  title={`Available in ${location}`}
                  products={props}
                  onShowAll={() => {
                    setSearchLocation(location);
                    setAppliedSearchLocation(location);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No products found matching your filters.</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

      </section>

      {/* Filters Sheet */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 border-l-0 rounded-l-3xl">
          <SheetHeader className="flex flex-row items-center justify-between border-b border-border/50 px-4 pb-4 safe-area-pt shrink-0 space-y-0">
            <button
              onClick={closeFilters}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted/50 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6 text-foreground" />
            </button>
            <SheetTitle className="text-lg font-semibold text-foreground">Filters</SheetTitle>
            <div className="w-10" /> {/* Spacer for precise centering */}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
            {/* Price Range */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Price range</h3>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={2000}
                step={50}
                className="mt-6"
              />
              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex-1 p-4 border border-border/50 rounded-2xl bg-card shadow-sm">
                  <p className="text-xs text-muted-foreground font-medium">Minimum</p>
                  <p className="font-bold text-foreground text-lg">₱{priceRange[0].toLocaleString()}</p>
                </div>
                <span className="text-muted-foreground">–</span>
                <div className="flex-1 p-4 border border-border/50 rounded-2xl bg-card shadow-sm">
                  <p className="text-xs text-muted-foreground font-medium">Maximum</p>
                  <p className="font-bold text-foreground text-lg">₱{priceRange[1].toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Categories (inside Filters too) */}
            <div className="space-y-6 border-t border-border/50 pt-8">
              <h3 className="text-xl font-semibold text-foreground">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                      selectedCategories.includes(cat)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border/50 hover:border-primary/50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border/50 bg-card safe-area-pb shrink-0">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" onClick={clearFilters} className="underline font-semibold text-foreground">
                Clear all
              </Button>
              <Button
                onClick={applyFilters}
                className="rounded-xl px-6 h-12 bg-primary hover:bg-primary/90 font-semibold flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </Layout>
  );
}
