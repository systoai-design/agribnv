import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '@/types/database';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface FeaturedFarmsCarouselProps {
  properties: Property[];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop';
const MAX_FEATURED = 6;
const AUTOPLAY_INTERVAL_MS = 7000;

function getHeroImage(property: Property): string {
  const images = property.images?.slice().sort((a, b) => a.display_order - b.display_order) ?? [];
  return images[0]?.image_url ?? FALLBACK_IMAGE;
}

// Full-bleed swipeable hero banner for the top "Featured Farms" section — one large image per
// slide with dot pagination, distinct from the smaller card rows used for the location carousels
// further down the page. Auto-advances every 7s (paused for prefers-reduced-motion); manual swipe
// always works and resets the auto-advance clock so it never fights the user mid-gesture.
export function FeaturedFarmsCarousel({ properties }: FeaturedFarmsCarouselProps) {
  const featured = properties.slice(0, MAX_FEATURED);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.children.length === 0) return;
    const slideWidth = el.children[0].clientWidth;
    if (slideWidth === 0) return;
    setActiveIndex(Math.round(el.scrollLeft / slideWidth));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, featured.length]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el || el.children.length === 0) return;
    const slideWidth = el.children[0].clientWidth;
    if (slideWidth === 0) return;
    el.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    setActiveIndex(index);
    haptics.light();
  }, []);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const prevIndex = (activeIndex - 1 + featured.length) % featured.length;
    scrollToIndex(prevIndex);
  }, [activeIndex, featured.length, scrollToIndex]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const nextIndex = (activeIndex + 1) % featured.length;
    scrollToIndex(nextIndex);
  }, [activeIndex, featured.length, scrollToIndex]);

  // Auto-advance. Re-armed on every scroll event (manual swipe or programmatic), so a manual
  // swipe always gets a full fresh interval afterward instead of being interrupted mid-gesture.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || prefersReducedMotion || featured.length <= 1) return;

    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      const slideWidth = el.children[0]?.clientWidth ?? 0;
      if (slideWidth === 0) return;
      const nextIndex = (Math.round(el.scrollLeft / slideWidth) + 1) % featured.length;
      el.scrollTo({ left: nextIndex * slideWidth, behavior: 'smooth' });
    };
    const rearm = () => {
      clearTimeout(timer);
      timer = setTimeout(advance, AUTOPLAY_INTERVAL_MS);
    };

    rearm();
    el.addEventListener('scroll', rearm, { passive: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', rearm);
    };
  }, [prefersReducedMotion, featured.length]);

  if (featured.length === 0) return null;

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth gap-4 md:rounded-2xl md:overflow-hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featured.map((property) => (
          <Link
            key={property.id}
            to={`/properties/${property.id}`}
            onClick={() => haptics.light()}
            className="relative snap-center shrink-0 w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] md:h-[340px] md:max-h-[38vh] rounded-2xl overflow-hidden group/card cursor-pointer"
          >
            <img
              src={getHeroImage(property)}
              alt={property.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
              <p className="font-serif text-lg md:text-2xl font-bold text-white leading-tight">
                {property.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-white/90 text-xs md:text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-white/80" />
                <span className="truncate">{property.location}</span>
              </div>
              <p className="mt-1 text-secondary font-semibold text-xs md:text-sm">
                ₱{property.price_per_night.toLocaleString()}/night
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Prev / Next navigation arrows */}
      {featured.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous featured property"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 bg-background/80 hover:bg-background backdrop-blur-md shadow-md rounded-full flex items-center justify-center border border-border/40 text-foreground transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next featured property"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 bg-background/80 hover:bg-background backdrop-blur-md shadow-md rounded-full flex items-center justify-center border border-border/40 text-foreground transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Clickable Pagination Dots */}
      {featured.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5" aria-label="Carousel pagination">
          {featured.map((property, i) => (
            <button
              key={property.id}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300 cursor-pointer p-0 border-0',
                i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-primary/25 hover:bg-primary/50',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
