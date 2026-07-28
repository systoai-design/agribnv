import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Home, Compass, Tractor, CalendarDays, Users, MapPin, Leaf } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { ListingType } from '@/types/database';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  onLocationChange: (location: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  experience?: string;
  onExperienceChange?: (experience: string) => void;
  onSearch?: () => void;
  listingType?: ListingType;
  onListingTypeChange?: (type: ListingType) => void;
}

const SUGGESTED_DESTINATIONS = [
  { name: 'Tagaytay', emoji: '🏔️' },
  { name: 'Baguio', emoji: '🌲' },
  { name: 'Batangas', emoji: '🌋' },
  { name: 'La Union', emoji: '🏄' },
  { name: 'Guimaras', emoji: '🥭' },
];

const SUGGESTED_EXPERIENCES = [
  { name: 'Farm Tour', emoji: '🚜' },
  { name: 'Fruit Picking', emoji: '🍎' },
  { name: 'Culinary', emoji: '👨‍🍳' },
  { name: 'Animal Care', emoji: '🐑' },
];

const TABS: { id: ListingType; label: string; icon: typeof Home }[] = [
  { id: 'farm_stay', label: 'Stays', icon: Home },
  { id: 'farm_experience', label: 'Experiences', icon: Compass },
  { id: 'farm_tour', label: 'Tours', icon: Tractor },
];

const springTransition = { type: 'spring', damping: 25, stiffness: 350 };

export function MobileSearchModal({
  isOpen,
  onClose,
  location,
  onLocationChange,
  dateRange,
  onDateRangeChange,
  guestCount,
  onGuestCountChange,
  experience = '',
  onExperienceChange,
  onSearch,
  listingType = 'farm_stay',
  onListingTypeChange,
}: MobileSearchModalProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSearch = () => {
    onSearch?.();
    onClose();
  };

  const handleClear = () => {
    onLocationChange('');
    onDateRangeChange({ from: undefined, to: undefined });
    onGuestCountChange(1);
    onExperienceChange?.('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="mobile-search-modal"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springTransition}
            className="fixed inset-x-0 bottom-0 top-12 z-[100] bg-card rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border-t border-border/50"
          >
            {/* Header */}
            <div className="bg-primary/5 px-4 pt-4 pb-4 shrink-0 flex flex-col gap-4 relative border-b border-primary/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Tractor className="h-5 w-5" />
                  Find your farm escape
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-background/50 hover:bg-background/80 transition-all"
                >
                  <X className="h-5 w-5 text-foreground" />
                </motion.button>
              </div>

              {/* Listing Type Toggle */}
              <div className="flex bg-background/60 p-1 rounded-xl shadow-inner relative">
                {TABS.map((tab) => {
                  const isActive = listingType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onListingTypeChange?.(tab.id)}
                      className={cn(
                        'flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all relative z-10',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <tab.icon className="h-4 w-4 relative z-20" />
                      <span className="relative z-20">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              
              {/* Destination Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Destination
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search destinations (e.g. Tagaytay)"
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    className="pl-11 h-14 rounded-2xl border-2 border-border focus:border-primary bg-background text-base shadow-sm"
                  />
                </div>
                
                {/* Horizontal Chips */}
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-5 px-5 scrollbar-hide">
                  {SUGGESTED_DESTINATIONS.map((dest) => (
                    <motion.button
                      key={dest.name}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onLocationChange(dest.name)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/50 bg-background whitespace-nowrap shadow-sm transition-colors",
                        location.toLowerCase() === dest.name.toLowerCase() ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/50 text-muted-foreground"
                      )}
                    >
                      <span>{dest.emoji}</span>
                      <span className="font-medium text-sm">{dest.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Dates Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" /> Trip Dates
                </label>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className={cn(
                      "flex-1 h-14 border-2 rounded-2xl flex flex-col justify-center px-4 transition-all text-left",
                      isCalendarOpen ? "border-primary bg-primary/5" : "border-border bg-background shadow-sm"
                    )}
                  >
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check in</span>
                    <span className="font-medium text-foreground truncate">
                      {dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : 'Add date'}
                    </span>
                  </button>
                  <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className={cn(
                      "flex-1 h-14 border-2 rounded-2xl flex flex-col justify-center px-4 transition-all text-left",
                      isCalendarOpen ? "border-primary bg-primary/5" : "border-border bg-background shadow-sm"
                    )}
                  >
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check out</span>
                    <span className="font-medium text-foreground truncate">
                      {dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'Add date'}
                    </span>
                  </button>
                </div>

                <AnimatePresence>
                  {isCalendarOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-card rounded-2xl border border-border shadow-sm p-2"
                    >
                      <CalendarComponent
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
                        disabled={{ before: new Date() }}
                        numberOfMonths={1}
                        className="mx-auto"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Guests Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Guests
                </label>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-background shadow-sm">
                  <div>
                    <p className="font-semibold text-foreground">Number of guests</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                      disabled={guestCount <= 1}
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border transition-all text-lg",
                        guestCount <= 1 
                          ? "border-border/50 text-muted-foreground/30 cursor-not-allowed" 
                          : "border-primary/30 text-primary hover:bg-primary/5"
                      )}
                    >
                      -
                    </motion.button>
                    <span className="w-6 text-center font-bold text-lg">{guestCount}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onGuestCountChange(guestCount + 1)}
                      className="h-10 w-10 rounded-full flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/5 transition-all text-lg"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-4 pb-6">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" /> Experience
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search experiences (e.g. Farm Tour)"
                    value={experience}
                    onChange={(e) => onExperienceChange?.(e.target.value)}
                    className="pl-11 h-14 rounded-2xl border-2 border-border focus:border-primary bg-background text-base shadow-sm"
                  />
                </div>
                
                {/* Horizontal Chips */}
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-5 px-5 scrollbar-hide">
                  {SUGGESTED_EXPERIENCES.map((exp) => (
                    <motion.button
                      key={exp.name}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onExperienceChange?.(exp.name)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/50 bg-background whitespace-nowrap shadow-sm transition-colors",
                        experience.toLowerCase() === exp.name.toLowerCase() ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/50 text-muted-foreground"
                      )}
                    >
                      <span>{exp.emoji}</span>
                      <span className="font-medium text-sm">{exp.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky Footer */}
            <div className="p-4 bg-background border-t border-border/50 safe-area-pb shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="flex-1 rounded-xl h-14 gap-2 bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg"
                >
                  <Search className="h-5 w-5" />
                  Search Farm Stays
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
