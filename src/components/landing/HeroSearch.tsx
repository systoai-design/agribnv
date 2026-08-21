import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Minus, Plus, Leaf, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type Field = 'where' | 'when' | 'who' | 'what';

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

const SUGGESTED_EXPERIENCES = [
  { name: 'Farm Tour', description: 'Guided walks & learning' },
  { name: 'Fruit Picking', description: 'Harvest your own' },
  { name: 'Culinary', description: 'Farm to table cooking' },
  { name: 'Animal Care', description: 'Feed and care for animals' },
];

function ResponsiveDropdown({
  open,
  onOpenChange,
  trigger,
  children,
  popoverProps,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  popoverProps?: React.ComponentProps<typeof PopoverContent>;
}) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, open]);

  if (isMobile) {
    const modalContent = (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 pointer-events-auto"
              onClick={() => onOpenChange(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-[90vw] max-w-[400px] bg-background rounded-3xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
            >
              <div className="max-h-[70vh] overflow-y-auto p-5">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );

    return (
      <>
        {React.cloneElement(trigger as React.ReactElement, {
          onClick: () => onOpenChange(true),
        })}
        {mounted && createPortal(modalContent, document.body)}
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent {...popoverProps}>
        {children}
      </PopoverContent>
    </Popover>
  );
}

// Compact booking search embedded in the hero. On submit it hands the query to /explore
// via URL params, which Explore reads on mount — so search works from a cold landing.
export function HeroSearch() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [openField, setOpenField] = useState<Field | null>(null);
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [month, setMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [guests, setGuests] = useState(1);
  const [experience, setExperience] = useState('');

  // Close popover on page scroll (desktop only)
  useEffect(() => {
    if (isMobile || !openField) return;

    const handleScroll = () => {
      setOpenField(null);
    };

    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [openField, isMobile]);

  const formatDates = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d')}`;
    }
    if (dateRange.from) return format(dateRange.from, 'MMM d');
    return 'Dates';
  };

  const handleSearch = () => {
    setOpenField(null);
    const params = new URLSearchParams();
    const loc = location.trim();
    if (loc) params.set('location', loc);
    if (dateRange.from) params.set('checkin', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange.to) params.set('checkout', format(dateRange.to, 'yyyy-MM-dd'));
    if (guests > 1) params.set('guests', String(guests));
    const exp = experience.trim();
    if (exp) params.set('experience', exp);
    const qs = params.toString();
    navigate(qs ? `/explore?${qs}` : '/explore');
  };

  // A tappable field. Transparent on desktop (dividers separate them); a soft filled
  // input on mobile where the fields stack.
  const fieldClass =
    'flex-1 min-w-0 px-4 py-3 text-left rounded-xl md:rounded-full bg-black/[0.03] md:bg-transparent hover:bg-black/[0.05] md:hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--forest))]';

  return (
    <div className="w-full max-w-4xl mx-auto text-left">
      <div className="bg-white rounded-[26px] md:rounded-full shadow-2xl shadow-black/30 ring-1 ring-black/5 p-2 md:p-1.5 flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
        
        {/* WHERE */}
        <ResponsiveDropdown
          open={openField === 'where'}
          onOpenChange={(o) => setOpenField(o ? 'where' : null)}
          trigger={
            <button type="button" className={fieldClass}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Where</p>
              <p className={cn('text-sm truncate', location ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                {location || 'Destination'}
              </p>
            </button>
          }
          popoverProps={{ className: 'w-[340px] p-5 rounded-3xl shadow-xl border-0', align: 'start', side: 'top', sideOffset: 14 }}
        >
          <Input
            placeholder="Destination"
            aria-label="Destination"
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
        </ResponsiveDropdown>

        <div className="hidden md:block h-8 w-px bg-border/70 shrink-0" />

        {/* WHEN */}
        <ResponsiveDropdown
          open={openField === 'when'}
          onOpenChange={(o) => setOpenField(o ? 'when' : null)}
          trigger={
            <button type="button" className={fieldClass}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">When</p>
              <p className={cn('text-sm truncate', dateRange.from ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                {formatDates()}
              </p>
            </button>
          }
          popoverProps={{ className: 'w-auto p-0 rounded-3xl shadow-xl border-0', align: 'center', side: 'top', sideOffset: 14 }}
        >
          <div className="flex flex-col gap-2 pointer-events-auto p-4 pt-5">
            <div className="flex flex-col justify-center items-center px-4 mb-3 gap-3">
               <div className="flex items-center gap-3 w-full justify-center">
                 <div 
                   className={cn("relative flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer", dateRange.from ? "border-[hsl(var(--forest))] bg-[hsl(var(--forest))] text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50")}
                   onClick={(e) => {
                     const input = e.currentTarget.querySelector('input');
                     if (input) {
                       try { input.showPicker(); } catch (err) { input.focus(); }
                     }
                   }}
                 >
                   <input 
                     type="date"
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                     min={format(new Date(), 'yyyy-MM-dd')}
                     onChange={(e) => {
                       if (e.target.value) {
                         const [y, m, d_val] = e.target.value.split('-');
                         const d = new Date(parseInt(y), parseInt(m) - 1, parseInt(d_val));
                         if (!isNaN(d.getTime())) {
                           setDateRange(prev => ({ ...prev, from: d }));
                           setMonth(d);
                         }
                       } else {
                         setDateRange(prev => ({ ...prev, from: undefined }));
                       }
                     }}
                   />
                   <span className="whitespace-nowrap">{dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : 'Check in'}</span>
                   <ChevronDown className="w-3 h-3 opacity-60" />
                 </div>

                 <span className="text-gray-400 font-medium">–</span>

                 <div 
                   className={cn("relative flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer", dateRange.to ? "border-[hsl(var(--forest))] bg-[hsl(var(--forest))] text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50")}
                   onClick={(e) => {
                     const input = e.currentTarget.querySelector('input');
                     if (input) {
                       try { input.showPicker(); } catch (err) { input.focus(); }
                     }
                   }}
                 >
                   <input 
                     type="date"
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                     min={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                     onChange={(e) => {
                       if (e.target.value) {
                         const [y, m, d_val] = e.target.value.split('-');
                         const d = new Date(parseInt(y), parseInt(m) - 1, parseInt(d_val));
                         if (!isNaN(d.getTime())) {
                           setDateRange(prev => ({ ...prev, to: d }));
                           setMonth(d);
                         }
                       } else {
                         setDateRange(prev => ({ ...prev, to: undefined }));
                       }
                     }}
                   />
                   <span className="whitespace-nowrap">{dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'Check out'}</span>
                   <ChevronDown className="w-3 h-3 opacity-60" />
                 </div>
               </div>
            </div>
            <div className="flex justify-center">
              <Calendar
                month={month}
                onMonthChange={setMonth}
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                disabled={{ before: new Date() }}
                numberOfMonths={isMobile ? 1 : 2}
                className="rounded-xl"
              />
            </div>
          </div>
        </ResponsiveDropdown>

        <div className="hidden md:block h-8 w-px bg-border/70 shrink-0" />

        {/* WHO */}
        <ResponsiveDropdown
          open={openField === 'who'}
          onOpenChange={(o) => setOpenField(o ? 'who' : null)}
          trigger={
            <button type="button" className={fieldClass}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Who</p>
              <p className={cn('text-sm truncate', guests > 1 ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                {guests > 1 ? `${guests} guests` : 'Guests'}
              </p>
            </button>
          }
          popoverProps={{ className: 'w-[300px] p-5 rounded-3xl shadow-xl border-0', align: 'center', side: 'top', sideOffset: 14 }}
        >
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
        </ResponsiveDropdown>

        <div className="hidden md:block h-8 w-px bg-border/70 shrink-0" />

        {/* WHAT */}
        <ResponsiveDropdown
          open={openField === 'what'}
          onOpenChange={(o) => setOpenField(o ? 'what' : null)}
          trigger={
            <button type="button" className={fieldClass}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">What</p>
              <p className={cn('text-sm truncate', experience ? 'text-gray-900 font-medium' : 'text-gray-400')}>
                {experience || 'Search experiences'}
              </p>
            </button>
          }
          popoverProps={{ className: 'w-[340px] p-5 rounded-3xl shadow-xl border-0', align: 'start', side: 'top', sideOffset: 14 }}
        >
          <Input
            placeholder="Experience"
            aria-label="Search experiences"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="rounded-xl mb-4"
            autoFocus
          />
          <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Popular experiences</p>
          <div className="space-y-1">
            {SUGGESTED_EXPERIENCES.map((exp) => (
              <button
                key={exp.name}
                type="button"
                onClick={() => {
                  setExperience(exp.name);
                  setOpenField(null);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
              >
                <span
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'hsl(var(--sage) / 0.25)' }}
                >
                  <Leaf className="h-4 w-4" style={{ color: 'hsl(var(--forest))' }} />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-gray-900 truncate">{exp.name}</span>
                  <span className="block text-sm text-gray-500 truncate">{exp.description}</span>
                </span>
              </button>
            ))}
          </div>
        </ResponsiveDropdown>

        {/* SEARCH */}
        <div className="md:pl-1.5 md:pr-1 mt-2 md:mt-0">
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
