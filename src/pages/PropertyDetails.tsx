import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PhotoGalleryModal } from '@/components/properties/PhotoGalleryModal';
import { FarmExperiences } from '@/components/properties/FarmExperiences';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { AmenitiesModal } from '@/components/properties/AmenitiesModal';
import { FarmerProfileModal } from '@/components/properties/FarmerProfileModal';
import { PropertyCalendarModal, FarmEvent } from '@/components/properties/PropertyCalendarModal';
import PropertyMap from '@/components/map/PropertyMap';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useShare } from '@/hooks/useShare';
import { useConversations } from '@/hooks/useConversations';
import { useAvailability } from '@/hooks/useAvailability';
import { Property, Experience, CATEGORY_LABELS, CANCELLATION_POLICY_LABELS, CANCELLATION_POLICY_DESCRIPTIONS } from '@/types/database';
import {
  MapPin, Users, BedDouble, Bath, Wifi, Car, Utensils, TreePine, Tv, Wind,
  Clock, ChevronLeft, ChevronRight, Loader2, Star, Share, Heart, Grid3X3,
  Warehouse, DoorOpen, ShieldCheck, X, Award, CalendarDays, MessageCircle, Minus, Plus, ChefHat, Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Amenity icon mapping
const amenityIcons: Record<string, any> = {
  'Kitchen': Utensils,
  'Wifi': Wifi,
  'Free parking': Car,
  'Parking': Car,
  'Pool': TreePine,
  'TV': Tv,
  'Air conditioning': Wind,
  'Washer': Warehouse,
};


// Helper to format time (e.g., "14:00" -> "2:00 PM")
const formatTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return time;
  }
};

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { share } = useShare();
  const { getOrCreateConversation } = useConversations();
  
  const [property, setProperty] = useState<Property | null>(null);
  const { blockedRanges } = useAvailability(property?.id);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFarmerProfile, setShowFarmerProfile] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [guestCount, setGuestCount] = useState(1);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Share handler
  const handleShare = () => {
    if (!property) return;
    share({
      title: property.name,
      text: `Check out ${property.name} in ${property.location}! 🌿`,
      url: window.location.href,
    });
  };

  // Contact host handler
  const handleContactHost = async () => {
    if (!user) {
      toast({
        title: 'Sign in to message host',
        description: 'Create an account to send messages to hosts.',
      });
      navigate('/auth');
      return;
    }

    if (!property) return;

    setIsStartingConversation(true);
    try {
      const conversationId = await getOrCreateConversation(property.id, property.host_id);
      if (conversationId) {
        navigate(`/inbox?conversation=${conversationId}`);
      } else {
        navigate('/inbox');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      navigate('/inbox');
    } finally {
      setIsStartingConversation(false);
    }
  };

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    // Fetch property with images, experiences
    const { data, error } = await supabase
      .from('properties')
      .select(`*, images:property_images(*), experiences(*)`)
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      // Fetch real host profile
      const { data: hostProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.host_id)
        .single();

      const propertyWithHost = {
        ...data,
        host: hostProfile || { full_name: 'Host', avatar_url: null, bio: null },
      };
      setProperty(propertyWithHost as unknown as Property);
    }
    setIsLoading(false);
  };

  const nights = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) : 0;

  // Calendar disabled matchers: past dates + already-booked ranges
  const disabledDates = [
    { before: new Date() },
    ...blockedRanges.map((r) => ({ from: r.from, to: r.to })),
  ];

  const specialEvents: FarmEvent[] = [
    {
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      title: "Harvest Festival",
      description: "Join us for our annual harvest festival. Experience fruit picking and enjoy a farm-to-table feast.",
      image: "https://images.unsplash.com/photo-1595859733475-7b565158654c?auto=format&fit=crop&q=80&w=600"
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      title: "Goat Milking Workshop",
      description: "Learn how to milk goats and make fresh artisanal cheese in this hands-on workshop.",
      image: "https://images.unsplash.com/photo-1524424364114-1246c4f1c79e?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const mockExperiences = [
    {
      id: 'mock-1',
      property_id: property?.id || '',
      name: 'Morning Goat Milking',
      description: 'Join us at sunrise to milk our friendly dairy goats. Fresh milk included!',
      price: 250,
      duration_hours: 1,
      max_participants: 4,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      property_id: property?.id || '',
      name: 'Organic Harvest Tour',
      description: 'Harvest your own vegetables for dinner and learn about sustainable farming.',
      price: 400,
      duration_hours: 2,
      max_participants: 6,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];
  const displayExperiences = property?.experiences?.length ? property.experiences : mockExperiences;

  const accommodationTotal = nights * (property?.price_per_night || 0);
  const experiencesTotal = selectedExperiences.reduce((sum, expId) => {
    const exp = displayExperiences.find(e => e.id === expId);
    return sum + (exp?.price || 0);
  }, 0);
  const serviceFee = Math.round(accommodationTotal * 0.12);
  const totalPrice = accommodationTotal + experiencesTotal + serviceFee;

  const handleBooking = async () => {
    if (!dateRange.from || !dateRange.to || !property) return;

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in or create an account to book.',
      });
      navigate('/auth');
      return;
    }

    setIsBooking(true);
    try {
      const checkIn = format(dateRange.from, 'yyyy-MM-dd');
      const checkOut = format(dateRange.to, 'yyyy-MM-dd');

      // Pre-check for overlap so the user sees a friendly error instead of
      // a raw constraint violation. The DB-level EXCLUDE constraint is the
      // real safety net if a concurrent booking sneaks in between.
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('property_id', property.id)
        .in('status', ['pending', 'confirmed'])
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)
        .limit(1);

      if (conflicts && conflicts.length > 0) {
        toast({
          title: 'Dates not available',
          description: 'Someone already booked these dates. Please pick different ones.',
          variant: 'destructive',
        });
        return;
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          guest_id: user.id,
          property_id: property.id,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestCount,
          total_price: totalPrice,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23P01' || error.message?.includes('no_overlapping_bookings')) {
          toast({
            title: 'Dates not available',
            description: 'These dates were just booked. Please pick different ones.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      if (selectedExperiences.length > 0 && booking) {
        const expInserts = selectedExperiences.map(expId => {
          const exp = displayExperiences.find(e => e.id === expId);
          return {
            booking_id: booking.id,
            experience_id: expId,
            scheduled_date: format(dateRange.from!, 'yyyy-MM-dd'),
            participants: guestCount,
            price_at_booking: exp?.price || 0,
          };
        });
        await supabase.from('booking_experiences').insert(expInserts);
      }

      toast({
        title: 'Booking request sent! 🎉',
        description: 'The host will review your booking. Check your trips for updates.',
      });
      navigate('/bookings');
    } catch (error: any) {
      toast({ title: 'Booking failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 safe-area-pt flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-semibold">Property not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4 rounded-lg">Back to Explore</Button>
        </div>
      </Layout>
    );
  }

  const images = property.images?.sort((a, b) => a.display_order - b.display_order) || [];
  const imageUrls = images.length > 0 
    ? images.map(img => img.image_url) 
    : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'];

  return (
    <Layout hideNavbarOnMobile={true} showMobileNav={false} showFooter={false}>
      {/* Mobile Header - Transparent with floating buttons only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 pointer-events-none safe-area-pt">
        <div className="flex items-center justify-between p-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="h-11 w-11 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center pointer-events-auto"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          <div className="flex gap-2 pointer-events-auto">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="h-11 w-11 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center"
            >
              <Share className="h-4 w-4 text-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLiked(!isLiked)}
              className="h-11 w-11 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center"
            >
              <Heart className={cn('h-4 w-4', isLiked ? 'fill-destructive text-destructive' : 'text-foreground')} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Full-Width Image Carousel */}
      <div className="md:hidden relative safe-area-pt">
        <div 
          className="relative h-[280px] flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onScroll={(e) => {
            const element = e.currentTarget;
            const scrollLeft = element.scrollLeft;
            const width = element.clientWidth;
            const newIndex = Math.round(scrollLeft / width);
            if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < imageUrls.length) {
              setCurrentImageIndex(newIndex);
            }
          }}
        >
          {imageUrls.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`${property.name} - ${idx + 1}`}
              className="w-full h-full object-cover shrink-0 snap-center"
            />
          ))}
        </div>
        
        {/* Overlays (dots and counter) */}
        {imageUrls.length > 1 && (
          <>
            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
              {imageUrls.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  )}
                />
              ))}
            </div>
            {/* Image counter & View all button */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
              <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
                {currentImageIndex + 1} / {imageUrls.length}
              </div>
              <button 
                onClick={() => setShowAllPhotos(true)}
                className="bg-white/90 text-black text-xs font-medium px-3 py-1.5 rounded-md shadow-sm active:scale-95 transition-transform"
              >
                View all
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Content */}
      <div className="md:hidden px-4 py-4 pb-24 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold">{property.name}</h1>
          <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[property.category]} · {property.location}</p>
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">4.9</span>
            <span className="text-sm text-muted-foreground underline">(120 reviews)</span>
          </div>
        </div>

        {/* Host Info */}
        <div className="flex items-center justify-between gap-4 py-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={property.host?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {property.host?.full_name?.charAt(0) || 'H'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium leading-tight">Hosted by {property.host?.full_name || 'Jesus'}</p>
              <p className="text-sm text-muted-foreground">Host</p>
            </div>
          </div>
          <Button 
            size="sm" 
            className="rounded-full px-4 h-8 text-xs bg-[#156530] text-white hover:bg-[#156530]/90 shadow-none shrink-0"
            onClick={() => setShowFarmerProfile(true)}
          >
            Know the farmer
          </Button>
        </div>

        {/* Quick highlights */}
        <div className="space-y-4 py-4 border-b border-border/50">
          <div className="flex gap-4">
            <Users className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-medium">{property.max_guests} guests · {property.bedrooms} bedroom · {property.bathrooms} bath</p>
            </div>
          </div>
          <div className="flex gap-4">
            <DoorOpen className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-medium">Self check-in</p>
              <p className="text-sm text-muted-foreground">Check yourself in with the lockbox</p>
            </div>
          </div>

        </div>

        {/* Description */}
        <div className="py-4 border-b border-border/50">
          <AnimatePresence mode="wait">
            <motion.p 
              key={showFullDescription ? 'full' : 'clipped'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn("text-sm leading-relaxed", !showFullDescription && "line-clamp-4")}
            >
              {property.description}
            </motion.p>
          </AnimatePresence>
          {property.description && property.description.length > 200 && (
            <Button 
              variant="link" 
              className="px-0 h-auto text-sm font-semibold underline mt-2"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="py-4 border-b border-border/50">
            <h3 className="font-semibold mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-3">
              {property.amenities.slice(0, 6).map((amenity) => {
                const IconComponent = amenityIcons[amenity] || Wifi;
                return (
                  <div key={amenity} className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                );
              })}
            </div>
            {property.amenities.length > 6 && (
              <Button 
                variant="outline" 
                className="w-full mt-4 rounded-lg border-foreground"
                onClick={() => setShowAmenitiesModal(true)}
              >
                Show all {property.amenities.length} amenities
              </Button>
            )}
          </div>
        )}

        {/* Farm-Fresh Kitchen Section */}
        <div className="py-6 border-b border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Farm-Fresh Kitchen</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enjoy farm-to-table meals prepared with organic ingredients harvested right from our fields. 
            You also have full access to our outdoor kitchen!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-lg">
              <Utensils className="h-4 w-4 text-primary" />
              <span>Farm-to-table meals</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-lg">
              <Leaf className="h-4 w-4 text-primary" />
              <span>Organic ingredients</span>
            </div>
          </div>
        </div>

        {/* Mobile Calendar Section */}
        <div className="py-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Select Dates</h3>
              <div className="flex items-start gap-2">
                <span className="inline-block w-2 h-2 mt-1.5 rounded-full bg-[#156530] shrink-0"></span> 
                <p className="text-muted-foreground text-sm leading-tight">
                  Highlighted days have<br/>special events!
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="rounded-full border-[#156530] text-[#156530] font-semibold px-6 hover:bg-[#156530]/5"
              onClick={() => setShowCalendarModal(true)}
            >
              Check availability
            </Button>
          </div>
        </div>

        {/* Map Section */}
        <div className="py-6 border-b border-border/50">
          <h3 className="font-semibold text-lg mb-2">Where you'll be</h3>
          <p className="text-sm text-muted-foreground mb-4">{property.location}</p>
          {property.latitude && property.longitude ? (
            <PropertyMap
              properties={[property]}
              selectedPropertyId={property.id}
              className="h-[200px] w-full rounded-xl"
            />
          ) : (
            <div className="h-[200px] w-full bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sage/20 to-primary/10" />
              <div className="text-center z-10">
                <MapPin className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Location not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Farm Experiences Section */}
        <FarmExperiences
          experiences={displayExperiences as Experience[]}
          selectedExperiences={selectedExperiences}
          onToggleExperience={(expId) => {
            if (selectedExperiences.includes(expId)) {
              setSelectedExperiences(selectedExperiences.filter(id => id !== expId));
            } else {
              setSelectedExperiences([...selectedExperiences, expId]);
            }
          }}
        />

        {/* Reviews section */}
        <div className="py-4">
          <h3 className="font-semibold mb-4">Reviews</h3>
          <ReviewsSection propertyId={id!} />
        </div>
      </div>

      {/* Mobile Sticky Bottom Booking Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 px-4 pt-3 pb-8 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">
              <span className="font-semibold">₱{property.price_per_night.toLocaleString()}</span>
              <span className="text-muted-foreground"> / night</span>
            </p>
            <p className="text-xs underline text-muted-foreground">
              {nights > 0 ? `${format(dateRange.from!, 'MMM d')} – ${format(dateRange.to!, 'MMM d')}` : 'Select dates'}
            </p>
          </div>
          <Button 
            onClick={handleBooking}
            disabled={!dateRange.from || !dateRange.to || isBooking}
            className="rounded-lg px-6 h-12 bg-primary hover:bg-primary/90 font-semibold"
          >
            {isBooking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reserve'}
          </Button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-xl md:text-2xl font-semibold mb-2">{property.name}</h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 text-sm">
              <span className="underline font-medium cursor-pointer hover:text-primary transition-colors">
                {property.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2 rounded-lg hover:bg-muted" onClick={handleShare}>
                <Share className="h-4 w-4" /> <span className="underline">Share</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 rounded-lg hover:bg-muted"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-destructive text-destructive')} /> 
                <span className="underline">Save</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-xl overflow-hidden mb-10"
        >
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px]">
            <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => setShowAllPhotos(true)}>
              <img src={imageUrls[0]} alt={property.name} className="w-full h-full object-cover hover:brightness-90 transition-all" />
            </div>
            {imageUrls.slice(1, 5).map((img, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "relative cursor-pointer",
                  idx === 1 && "rounded-tr-xl overflow-hidden",
                  idx === 3 && "rounded-br-xl overflow-hidden"
                )}
                onClick={() => setShowAllPhotos(true)}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" />
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-4 right-4 gap-2 bg-white hover:bg-white rounded-lg shadow-md border-foreground/20"
            onClick={() => setShowAllPhotos(true)}
          >
            <Grid3X3 className="h-4 w-4" /> Show all photos
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Type & Host */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">
                  {CATEGORY_LABELS[property.category]} in {property.location.split(',')[0]}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {property.max_guests} guests · {property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''} · {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''} · {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">4.9</span>
                  <span className="text-sm text-muted-foreground underline hover:text-foreground cursor-pointer transition-colors">(120 reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                  <AvatarImage src={property.host?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"} />
                  <AvatarFallback className="bg-foreground text-background font-semibold">
                    {property.host?.full_name?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>

            <Separator />

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >

              <div className="flex gap-6 items-start">
                <div className="p-2">
                  <DoorOpen className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Self check-in</p>
                  <p className="text-muted-foreground text-sm">Check yourself in with the lockbox.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="p-2">
                  <CalendarDays className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Free cancellation before check-in</p>
                  <p className="text-muted-foreground text-sm">Get a full refund if you change your mind.</p>
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatePresence mode="wait">
                <motion.p 
                  key={showFullDescription ? 'full' : 'clipped'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn("text-foreground leading-relaxed whitespace-pre-line", !showFullDescription && "line-clamp-6")}
                >
                  {property.description}
                </motion.p>
              </AnimatePresence>
              {property.description && property.description.length > 300 && (
                <Button 
                  variant="link" 
                  className="px-0 mt-2 underline text-foreground font-semibold"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </Button>
              )}
            </motion.div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-semibold mb-6">What this place offers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.slice(0, 10).map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || Wifi;
                      return (
                        <div key={amenity} className="flex items-center gap-4 py-2">
                          <IconComponent className="h-6 w-6 text-foreground" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                  {property.amenities.length > 10 && (
                    <Button 
                      variant="outline" 
                      className="mt-6 rounded-lg border-foreground"
                      onClick={() => setShowAmenitiesModal(true)}
                    >
                      Show all {property.amenities.length} amenities
                    </Button>
                  )}
                </motion.div>
              </>
            )}

            {/* Desktop Calendar Section */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Select Dates</h3>
                  <div className="flex items-start gap-2">
                    <span className="inline-block w-2.5 h-2.5 mt-1.5 rounded-full bg-[#156530] shrink-0"></span> 
                    <p className="text-muted-foreground leading-tight">
                      Highlighted days have<br/>special events!
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full border-[#156530] text-[#156530] font-semibold px-8 hover:bg-[#156530]/5"
                  onClick={() => setShowCalendarModal(true)}
                >
                  Check availability
                </Button>
              </div>
            </div>

            {/* Reviews */}
            <Separator />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="py-8"
            >
              <h3 className="text-xl font-semibold mb-6">Reviews</h3>
              <ReviewsSection propertyId={id!} />
            </motion.div>

            {/* Map Section */}
            <Separator className="mt-8" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-4"
            >
              <h3 className="text-xl font-semibold mb-2">Where you'll be</h3>
              <p className="text-muted-foreground mb-6">{property.location}</p>
              {property.latitude && property.longitude ? (
                <PropertyMap
                  properties={[property]}
                  selectedPropertyId={property.id}
                  className="h-[300px] md:h-[400px] rounded-xl"
                />
              ) : (
                <div className="h-[300px] md:h-[400px] bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sage/20 to-primary/10" />
                  <div className="text-center z-10">
                    <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Location coordinates not available</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Host Section */}
            <Separator className="mt-8" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="pt-4"
            >
              <h3 className="text-xl font-semibold mb-6">Meet your Host</h3>
              <div className="flex flex-col md:flex-row gap-8">
                <Card className="flex-shrink-0 p-6 text-center shadow-lg rounded-xl bg-gradient-to-br from-background to-muted/30">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-background shadow-lg">
                    <AvatarImage src={property.host?.avatar_url || undefined} />
                    <AvatarFallback className="bg-foreground text-background text-3xl font-semibold">
                      {property.host?.full_name?.charAt(0) || 'H'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xl font-semibold">{property.host?.full_name}</p>
                  {property.host?.bio && (
                    <p className="text-sm text-muted-foreground mt-2">{property.host.bio}</p>
                  )}
                </Card>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="font-semibold">About your host</p>
                    <p className="text-sm text-muted-foreground">
                      {property.host?.bio || 'Your host is looking forward to welcoming you!'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Button 
                      className="rounded-lg bg-foreground text-background hover:bg-foreground/90"
                      onClick={handleContactHost}
                      disabled={isStartingConversation}
                    >
                      {isStartingConversation ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <MessageCircle className="h-4 w-4 mr-2" />
                      )}
                      Message Host
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-lg border-foreground/20 hover:bg-muted"
                      onClick={() => setShowFarmerProfile(true)}
                    >
                      Know the farmer
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Things to Know */}
            <Separator className="mt-8" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="pt-4 pb-8"
            >
              <h3 className="text-xl font-semibold mb-6">Things to know</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">House rules</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Check-in: {property.check_in_time ? formatTime(property.check_in_time) : '2:00 PM'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Checkout: {property.check_out_time ? formatTime(property.check_out_time) : '12:00 PM'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {property.max_guests} guests maximum
                    </li>
                    {property.house_rules?.slice(0, 2).map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                  {property.house_rules && property.house_rules.length > 2 && (
                    <Button variant="link" className="px-0 mt-2 underline text-foreground font-semibold text-sm">
                      Show more
                    </Button>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Safety & property</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {property.safety_features && property.safety_features.length > 0 ? (
                      property.safety_features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          {feature}
                        </li>
                      ))
                    ) : (
                      <>
                        <li>Carbon monoxide alarm</li>
                        <li>Smoke detector</li>
                        <li>First aid kit</li>
                      </>
                    )}
                  </ul>
                  {property.safety_features && property.safety_features.length > 3 && (
                    <Button variant="link" className="px-0 mt-2 underline text-foreground font-semibold text-sm">
                      Show more
                    </Button>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Cancellation policy</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="font-medium text-foreground">
                      {property.cancellation_policy 
                        ? CANCELLATION_POLICY_LABELS[property.cancellation_policy]
                        : 'Moderate'}
                    </li>
                    <li>
                      {property.cancellation_policy 
                        ? CANCELLATION_POLICY_DESCRIPTIONS[property.cancellation_policy]
                        : 'Free cancellation up to 5 days before check-in'}
                    </li>
                  </ul>
                </div>
              </div>
              {property.additional_rules && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Additional information</h4>
                  <p className="text-sm text-muted-foreground">{property.additional_rules}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="shadow-xl border rounded-xl overflow-hidden">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">₱{property.price_per_night.toLocaleString()}</span>
                    <span className="text-muted-foreground">night</span>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 border-b">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="p-3 border-r hover:bg-muted/50 cursor-pointer transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-wide">Check-in</p>
                            <p className={cn("text-sm", !dateRange.from && "text-muted-foreground")}>
                              {dateRange.from ? format(dateRange.from, 'M/d/yyyy') : 'Add date'}
                            </p>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                            disabled={disabledDates}
                            numberOfMonths={1}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-wide">Checkout</p>
                            <p className={cn("text-sm", !dateRange.to && "text-muted-foreground")}>
                              {dateRange.to ? format(dateRange.to, 'M/d/yyyy') : 'Add date'}
                            </p>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                            disabled={[
                              { before: dateRange.from || new Date() },
                              ...blockedRanges.map((r) => ({ from: r.from, to: r.to })),
                            ]}
                            numberOfMonths={1}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                          <p className="text-[10px] font-bold uppercase tracking-wide">Guests</p>
                          <p className="text-sm">{guestCount} guest{guestCount > 1 ? 's' : ''}</p>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Guests</p>
                            <p className="text-sm text-muted-foreground">Max {property.max_guests}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              disabled={guestCount <= 1}
                              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{guestCount}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              disabled={guestCount >= property.max_guests}
                              onClick={() => setGuestCount(Math.min(property.max_guests, guestCount + 1))}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button 
                    className="w-full h-12 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                    disabled={!dateRange.from || !dateRange.to || isBooking}
                    onClick={handleBooking}
                  >
                    {isBooking ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reserve'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">You won't be charged yet</p>

                  {nights > 0 && (
                    <div className="space-y-3 text-sm pt-2">
                      <div className="flex justify-between">
                        <span className="underline">₱{property.price_per_night.toLocaleString()} × {nights} nights</span>
                        <span>₱{accommodationTotal.toLocaleString()}</span>
                      </div>
                      {experiencesTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="underline">Experiences</span>
                          <span>₱{experiencesTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="underline">Agribnv service fee</span>
                        <span>₱{serviceFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold pt-2">
                        <span>Total before taxes</span>
                        <span>₱{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Report listing link */}
              <div className="text-center mt-4">
                <Button variant="link" className="text-muted-foreground underline text-sm">
                  Report this listing
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <PhotoGalleryModal
        isOpen={showAllPhotos}
        onClose={() => setShowAllPhotos(false)}
        images={property.images && property.images.length > 0 ? property.images : imageUrls}
        propertyName={property.name}
        isLiked={isLiked}
        onToggleLike={() => setIsLiked(!isLiked)}
      />

      <AmenitiesModal
        isOpen={showAmenitiesModal}
        onClose={() => setShowAmenitiesModal(false)}
        amenities={property.amenities || []}
        propertyName={property.name}
      />

      <FarmerProfileModal
        isOpen={showFarmerProfile}
        onClose={() => setShowFarmerProfile(false)}
        host={property.host || null}
        property={property}
        onContactHost={handleContactHost}
        isStartingConversation={isStartingConversation}
      />

      <PropertyCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        dateRange={dateRange as any}
        setDateRange={(range) => setDateRange({ from: range?.from, to: range?.to })}
        disabledDates={disabledDates as Date[]}
        specialEvents={specialEvents}
        locationName={property.location}
      />
    </Layout>
  );
}
