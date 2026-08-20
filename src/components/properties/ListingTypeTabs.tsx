import { useNavigate } from 'react-router-dom';
import { Home, Sparkles, MapPin, ShoppingBag } from 'lucide-react';
import { ListingType } from '@/types/database';
import { cn } from '@/lib/utils';
import haptics from '@/utils/haptics';

interface ListingTypeTabsProps {
  selectedType: ListingType;
  onTypeChange: (type: ListingType) => void;
}

type TabItem =
  | { kind: 'filter'; id: ListingType; label: string; icon: React.ElementType }
  | { kind: 'link'; id: string; label: string; icon: React.ElementType; to: string };

const TABS: TabItem[] = [
  { kind: 'filter', id: 'farm_stay', label: 'Farm', icon: Home },
  { kind: 'filter', id: 'farm_experience', label: 'Experience', icon: Sparkles },
  { kind: 'filter', id: 'farm_tour', label: 'Tours', icon: MapPin },
  { kind: 'link', id: 'products', label: 'Products', icon: ShoppingBag, to: '/products' },
];

export function ListingTypeTabs({ selectedType, onTypeChange }: ListingTypeTabsProps) {
  const navigate = useNavigate();

  return (
    <div className="relative px-1 flex justify-center">
      <div className="inline-flex items-center justify-start sm:justify-center gap-1 p-1 bg-card shadow-soft border border-border/40 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
        {TABS.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                haptics.light();
                if (tab.kind === 'filter') {
                  onTypeChange(tab.id);
                } else {
                  // If it's a link, we just navigate to it. 
                  // But wait, if they are clicking a filter while on a link page?
                  // The parent handles that via onTypeChange.
                  navigate(tab.to);
                }
              }}
              className={cn(
                'relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium shrink-0 min-h-[40px]',
                'transition-all duration-200 ease-out active:scale-95 cursor-pointer',
                selectedType === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Fade + scroll affordance on mobile only — justify-center on sm+ never overflows there */}
      <div className="sm:hidden absolute right-1 top-0 bottom-0 w-6 bg-gradient-to-l from-card to-transparent pointer-events-none rounded-r-xl" />
    </div>
  );
}
