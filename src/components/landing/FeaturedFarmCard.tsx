import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowUpRight } from 'lucide-react';
import { Property } from '@/types/database';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop';

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

      {/* Rating chip — top right */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 ring-1 ring-white/20">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span className="text-white text-xs font-semibold">{rating}</span>
      </div>

      {/* Editor's pick badge — top left */}
      {editorsPick && (
        <div
          className="absolute top-3.5 left-3.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: 'hsl(var(--forest) / 0.85)', backdropFilter: 'blur(6px)' }}
        >
          Editor's pick
        </div>
      )}

      {/* Content */}
      <div className={cn('absolute inset-x-0 bottom-0 flex flex-col', expanded ? 'p-6 md:p-7' : 'p-4')}>
        <div className="flex items-center gap-1 text-white/85 mb-1">
          <MapPin className={expanded ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
          <span className={cn('line-clamp-1', expanded ? 'text-sm' : 'text-[11px]')}>{property.location}</span>
        </div>

        <h3
          className={cn(
            'font-bold text-white',
            expanded
              ? 'font-serif text-2xl md:text-3xl tracking-tight leading-tight line-clamp-2'
              : 'text-sm uppercase tracking-wide line-clamp-2'
          )}
        >
          {property.name}
        </h3>

        <div className={cn('flex items-center justify-between gap-2', expanded ? 'mt-4' : 'mt-2')}>
          <div className="flex items-baseline gap-1">
            <span className={cn('font-bold text-white', expanded ? 'text-xl' : 'text-sm')}>
              ₱{property.price_per_night.toLocaleString()}
            </span>
            <span className={cn('text-white/65', expanded ? 'text-sm' : 'text-[11px]')}>/night</span>
          </div>

          {expanded && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              View farm <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
