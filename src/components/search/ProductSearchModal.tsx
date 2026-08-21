import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  onLocationChange: (location: string) => void;
  onSearch: () => void;
}

const SUGGESTED_DESTINATIONS = [
  'Baguio',
  'Tagaytay',
  'Guimaras',
  'Laguna',
  'Batangas',
];

const springTransition = {
  type: 'spring',
  damping: 25,
  stiffness: 200,
};

export function ProductSearchModal({
  isOpen,
  onClose,
  location,
  onLocationChange,
  onSearch,
}: ProductSearchModalProps) {
  const [activeInput, setActiveInput] = useState<'where'>('where');

  const handleSearch = () => {
    haptics.light();
    onSearch();
    onClose();
  };

  const handleClear = () => {
    haptics.light();
    onLocationChange('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="product-search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="product-search-modal"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springTransition}
            className="fixed inset-x-0 bottom-0 top-12 z-[100] bg-card rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border-t border-border/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
              <h2 className="text-xl font-bold font-serif text-forest">Find Products</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-background/50 hover:bg-background/80 transition-all"
              >
                <X className="h-5 w-5 text-foreground" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-muted/10">
              
              {/* Destination Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Where to?
                </label>
                
                <div className={cn(
                  "flex items-center gap-3 p-4 border rounded-2xl bg-background transition-all shadow-sm focus-within:ring-2 focus-within:ring-primary/20",
                  activeInput === 'where' ? "border-primary" : "border-border"
                )}>
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Products"
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    onFocus={() => setActiveInput('where')}
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 text-lg"
                  />
                </div>
              </div>

              {/* Suggested Destinations */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground px-1">Suggested destinations</p>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                  {SUGGESTED_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => {
                        haptics.light();
                        onLocationChange(dest);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap shrink-0",
                        location === dest 
                          ? "border-primary bg-primary/10 text-primary font-semibold" 
                          : "border-border/50 bg-background text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      <MapPin className="h-4 w-4" />
                      {dest}
                    </button>
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
                  Search Products
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
