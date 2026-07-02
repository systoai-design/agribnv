import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { MapPin, Star, ArrowUpRight } from 'lucide-react';
import { Property } from '@/types/database';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop';

// Caption reveal is synced to the carousel slide so nothing races. Transitions are set inline
// (not via Tailwind's transition-[a,b] arbitrary utility — its comma breaks class extraction, so
// an adjacent duration-[…] silently never generates).
const CAPTION_EASE = 'cubic-bezier(0.65,0,0.35,1)';
const REVEAL_MS = 420; // how long the caption itself fades/slides in
const SLIDE_MS = 560; // matches the carousel slide duration in FeaturedFarmsSection
const COMPACT_TRANSITION = `opacity 400ms ${CAPTION_EASE}, transform 400ms ${CAPTION_EASE}`;

// The active caption reveals ONLY after the slide finishes (delay = slide duration), and hides
// immediately when the card leaves — so nothing animates on the caption mid-slide.
function largeTransition(expanded: boolean, reduce: boolean): string | undefined {
  if (reduce) return undefined;
  const delay = expanded ? SLIDE_MS : 0;
  return `opacity ${REVEAL_MS}ms ${CAPTION_EASE} ${delay}ms, transform ${REVEAL_MS}ms ${CAPTION_EASE} ${delay}ms`;
}

// Consistent pseudo-rating from id until real review aggregates are wired in here.
function pseudoRating(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (4.5 + (hash % 6) / 10).toFixed(1);
}

interface FeaturedFarmCardProps {
  property: Property;
  /** Large, focused presentation (active slide in the carousel). */
  expanded?: boolean;
  /** Show the "Editor's pick" badge — a fixed property of one farm, independent of size. */
  editorsPick?: boolean;
  className?: string;
}

export function FeaturedFarmCard({ property, expanded = false, editorsPick = false, className }: FeaturedFarmCardProps) {
  const primary = property.images?.find((img) => img.is_primary) || property.images?.[0];
  const imageUrl = primary?.image_url || FALLBACK_IMAGE;
  const rating = pseudoRating(property.id);
  const price = `₱${property.price_per_night.toLocaleString()}`;
  const reduce = useReducedMotion();

  return (
    <Link
      to={`/properties/${property.id}`}
      className={cn(
        'group relative block h-full w-full overflow-hidden rounded-[22px] shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-shadow duration-500',
        className
      )}
    >
      {/* Image */}
      <img
        src={imageUrl}
        alt={property.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />

      {/* Gradient scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Editor's pick badge — top left, when applicable */}
      {editorsPick && (
        <div
          className="absolute top-3.5 left-3.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: 'hsl(var(--forest) / 0.85)', backdropFilter: 'blur(6px)' }}
        >
          Editor's pick
        </div>
      )}

      {/* Rating chip — top right, only on the focused card so it never crowds a peek sliver */}
      {expanded && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 ring-1 ring-white/20">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-white text-xs font-semibold">{rating}</span>
        </div>
      )}

      {/* Content — the location is anchored at the bottom and never moves; name/price fade + slide
          in ABOVE it using transform/opacity only (no height/grid animation), synced to the 560ms
          slide. Nothing resizes or reflows, so the caption switch is fully fluid. */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="relative">
          {/* LARGE caption (active card) — sits above the location */}
          <div
            className={cn(
              'absolute inset-x-0 bottom-full pb-3',
              expanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
            )}
            style={{ transition: largeTransition(expanded, reduce) }}
          >
            <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight leading-tight text-white line-clamp-2">
              {property.name}
            </h3>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">{price}</span>
                <span className="text-sm text-white/65">/night</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 motion-reduce:transition-none" style={{ color: 'hsl(var(--forest))' }}>
                View farm <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* COMPACT caption — peek cards reveal it on hover/focus (never on the active card) */}
          <div
            className={cn(
              'absolute inset-x-0 bottom-full pb-2 opacity-0 translate-y-2 pointer-events-none',
              !expanded &&
                'group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0'
            )}
            style={{ transition: reduce ? undefined : COMPACT_TRANSITION }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wide text-white line-clamp-2">{property.name}</h3>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-sm font-bold text-white">{price}</span>
              <span className="text-[11px] text-white/65">/night</span>
            </div>
          </div>

          {/* LOCATION — always visible, anchored at the bottom (fixed position → never moves) */}
          <div className="flex items-center gap-1 text-white/85">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[13px] line-clamp-1">{property.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
