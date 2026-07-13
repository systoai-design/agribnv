import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Profile, Property } from '@/types/database';
import { Leaf, Calendar, Map, MessageCircle, Star, BadgeCheck } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface FarmerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: Profile | null;
  property: Property | null;
  onContactHost: () => void;
  isStartingConversation?: boolean;
}

export function FarmerProfileModal({
  isOpen,
  onClose,
  host,
  property,
  onContactHost,
  isStartingConversation = false,
}: FarmerProfileModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!host || !property) return null;

  // Placeholder facts since they aren't in the DB yet
  const facts = [
    { icon: Leaf, label: 'Farming Practice', value: 'Organic Certified' },
    { icon: Calendar, label: 'Generations', value: '3rd Generation' },
    { icon: Map, label: 'Farm Size', value: '15 Hectares' },
    { icon: BadgeCheck, label: 'Superhost', value: 'Since 2023' },
  ];

  const content = (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Custom Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        <span className="sr-only">Close</span>
      </button>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pb-24 relative z-10">
        <div className="w-full">
          {/* Decorative Header Background (Cover Picture) */}
          <div className="w-full h-48 bg-muted overflow-hidden relative shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000" 
              alt="Farm landscape" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full bg-background rounded-t-3xl -mt-6 relative z-20 px-6 pt-0 pb-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl -mt-16 bg-muted">
                <AvatarImage src={host.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  {host.full_name?.charAt(0) || 'H'}
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <h2 className="text-2xl font-bold text-foreground font-serif">Meet {host.full_name}</h2>
                <p className="text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>4.9 (120 reviews)</span>
                </p>
                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Speaks English & Tagalog</Badge>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted border-0">Responds in an hour</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-8">
          <section>
            <h3 className="font-semibold text-lg mb-3">About the Farmer</h3>
            <p className="text-muted-foreground leading-relaxed">
              {host.bio || `Welcome to ${property.name}! I'm passionate about sustainable agriculture and sharing our beautiful farm with guests. I look forward to welcoming you and showing you around our little piece of paradise.`}
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">What We Grow & Raise</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm py-1 border-primary/20 text-foreground bg-card">🍅 Heirloom Tomatoes</Badge>
              <Badge variant="outline" className="text-sm py-1 border-primary/20 text-foreground bg-card">🌾 Organic Rice</Badge>
              <Badge variant="outline" className="text-sm py-1 border-primary/20 text-foreground bg-card">🐐 Dairy Goats</Badge>
              <Badge variant="outline" className="text-sm py-1 border-primary/20 text-foreground bg-card">🍯 Artisan Honey</Badge>
              <Badge variant="outline" className="text-sm py-1 border-primary/20 text-foreground bg-card">🐔 Free-range Eggs</Badge>
            </div>
          </section>

          <section className="-mx-6 px-6">
            <h3 className="font-semibold text-lg mb-3">A Slice of Life</h3>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400',
                'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400'
              ].map((imgUrl, i) => (
                <div key={i} className="relative w-[220px] shrink-0 snap-center rounded-xl overflow-hidden shadow-sm aspect-[4/3]">
                  <img src={imgUrl} alt={`Slice of life ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">Farm Facts</h3>
            <div className="grid grid-cols-2 gap-3">
              {facts.map((fact, index) => {
                const Icon = fact.icon;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={fact.label}
                    className="p-4 rounded-xl bg-card border border-border/40 shadow-sm flex flex-col gap-2"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{fact.label}</p>
                      <p className="font-semibold text-sm">{fact.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Phone</p>
                  <p className="font-medium text-sm">{host.phone || '+63 917 123 4567'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{host.full_name?.split(' ')[0].toLowerCase() || 'hello'}@agribnv.com</p>
                </div>
              </div>
            </div>
          </section>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 z-20">
        <Button 
          className="w-full h-12 rounded-xl text-base font-semibold"
          onClick={onContactHost}
          disabled={isStartingConversation}
        >
          {isStartingConversation ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Starting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Message {host.full_name?.split(' ')[0] || 'Host'}
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none gap-0 [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Know the Farmer</DialogTitle>
          </DialogHeader>
          <div className="h-[80vh] max-h-[700px] flex flex-col">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] p-0 border-t-0 rounded-t-3xl overflow-hidden gap-0 [&>button]:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Know the Farmer</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
