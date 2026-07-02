import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type Field = 'where' | 'when' | 'who';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const SUGGESTED_DESTINATIONS = [
  { name: 'Tagaytay', description: 'Cool highland farms' },
  { name: 'Batangas', description: 'Beachside retreats' },
  { name: 'La Union', description: 'Surf and farm' },
  { name: 'Baguio', description: 'Mountain fresh' },
  { name: 'Guimaras', description: 'Mango paradise' },
];

// Compact booking search embedded in the hero. On submit it hands the query to /explore
// via URL params, which Explore reads on mount — so search works from a cold landing.
export function HeroSearch() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openField, setOpenField] = useState<Field | null>(null);
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [guests, setGuests] = useState(1);

  const formatDates = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d')}`;
    }
    if (dateRange.from) return format(dateRange.from, 'MMM d');
    return 'Any week';
  };

  const handleSearch = () => {
    setOpenField(null);
    const params = new URLSearchParams();
    const loc = location.trim();
    if (loc) params.set('location', loc);
    if (dateRange.from) params.set('checkin', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange.to) params.set('checkout', format(dateRange.to, 'yyyy-MM-dd'));
    if (guests > 1) params.set('guests', String(guests));
    const qs = params.toString();
    navigate(qs ? `/explore?${qs}` : '/explore');
  };

  // A tappable field. Transparent on desktop (dividers separate them); a soft filled
  // input on mobile where the fields stack.
  const fieldClass =
    'flex-1 min-w-0 px-5 py-3 text-left rounded-xl md:rounded-full bg-black/[0.03] md:bg-transparent hover:bg-black/[0.05] md:hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forest))]';

  return (
    <div className="w-full max-w-3xl mx-auto text-left">
      <div className="bg-white rounded-[26px] md:rounded-full shadow-2xl shadow-black/30 ring-1 ring-black/5 p-2 md:p-1.5 flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
        {/* WHERE */}
        <Popover open={openField === 'where'} onOpenChange={(o) => setOpenField(o ? 'where' : null)}>
          <PopoverTrigger asChild>
            <button type="button" className={fieldClass}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Where</p>
              <p className={cn('text-sm truncate', location ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                {location || 'Search destinations'}
              </p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] max-w-[calc(100vw-2rem)] p-5 rounded-3xl shadow-xl border-0" align="start" sideOffset={14}>
            <Input
              placeholder="Search destinations"
              aria-label="Search destinations"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl mb-4"
              autoFocus
            />
            <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Popular in the Philippines</p>
            <div className="space-y-1">
              {SUGGESTED_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => {
                    setLocation(dest.name);
                    setOpenField('when');
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
                >
                  <span
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'hsl(var(--sage) / 0.25)' }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: 'hsl(var(--forest))' }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-gray-900 truncate">{dest.name}</span>
                    <span className="block text-sm text-gray-500 truncate">{dest.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="hidden md:block h-8 w-px bg-border/70 shrink-0" />

        {/* WHEN */}
        <Popover open={openField === 'when'} onOpenChange={(o) => setOpenField(o ? 'when' : null)}>
          <PopoverTrigger asChild>
            <button type="button" className={fieldClass}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">When</p>
              <p className={cn('text-sm truncate', dateRange.from ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                {formatDates()}
              </p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-4 rounded-3xl shadow-xl border-0 overflow-x-auto" align="center" sideOffset={14}>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
              disabled={{ before: new Date() }}
              numberOfMonths={isMobile ? 1 : 2}
              className="rounded-xl pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <div className="hidden md:block h-8 w-px bg-border/70 shrink-0" />

        {/* WHO */}
        <Popover open={openField === 'who'} onOpenChange={(o) => setOpenField(o ? 'who' : null)}>
          <PopoverTrigger asChild>
            <button type="button" className={fieldClass}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Who</p>
              <p className={cn('text-sm truncate', guests > 1 ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                {guests > 1 ? `${guests} guests` : 'Add guests'}
              </p>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-5 rounded-3xl shadow-xl border-0" align="end" sideOffset={14}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Guests</p>
                <p className="text-sm text-gray-500">How many are coming?</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  aria-disabled={guests <= 1}
                  aria-label="Remove guest"
                  className={cn(
                    'h-9 w-9 rounded-full border flex items-center justify-center transition-colors',
                    // aria-disabled (not the native `disabled` attr) keeps the button in the tab order,
                    // so decrementing to the minimum while focused doesn't drop focus to <body>.
                    guests <= 1 ? 'opacity-40' : 'hover:bg-muted/60'
                  )}
                  style={{ borderColor: 'hsl(var(--forest) / 0.35)', color: 'hsl(var(--forest))' }}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span
                  className="w-6 text-center font-semibold tabular-nums text-gray-900"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {guests}
                </span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => g + 1)}
                  aria-label="Add guest"
                  className="h-9 w-9 rounded-full border flex items-center justify-center transition-colors hover:bg-muted/60"
                  style={{ borderColor: 'hsl(var(--forest) / 0.35)', color: 'hsl(var(--forest))' }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* SEARCH */}
        <div className="md:pl-1.5 md:pr-1">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            className="w-full md:w-auto h-12 px-6 rounded-xl md:rounded-full flex items-center justify-center gap-2 font-bold text-white shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--forest))]"
            style={{ backgroundColor: 'hsl(var(--forest))' }}
          >
            <Search className="h-4 w-4" />
            Search
          </motion.button>
        </div>
      </div>
    </div>
  );
}
