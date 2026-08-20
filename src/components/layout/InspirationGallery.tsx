import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/database';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { INSPIRATION_DESTINATIONS } from './Footer';
import { motion, AnimatePresence } from 'framer-motion';

interface InspirationGalleryProps {
  activeTab: string;
}

export function InspirationGallery({ activeTab }: InspirationGalleryProps) {
  const { ref, inView } = useInView({
    triggerOnce: true, // Only trigger the fetch once when it comes into view
    rootMargin: '200px 0px', // Start fetching when within 200px of viewport
  });

  const destinations = INSPIRATION_DESTINATIONS[activeTab] || [];
  const destinationNames = destinations.map((d) => d.name);

  const { data: properties, isLoading } = useQuery({
    queryKey: ['inspiration_properties', activeTab],
    queryFn: async () => {
      // Create a string for ilike filtering (e.g., matching 'Tagaytay, Cavite')
      // Supabase's 'in' filter is exact match, so for partial location matching,
      // it's tricky. Since seed data has locations like "Tagaytay City, Cavite",
      // we use an OR query with ilike for each destination.
      const orQuery = destinationNames
        .map((name) => `location.ilike."%${name}%"`)
        .join(',');

      const { data, error } = await supabase
        .from('properties')
        .select('*, property_images(*)')
        .eq('is_published', true)
        .or(orQuery)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to fetch inspiration properties:', error);
        throw error;
      }
      
      console.log('Fetched properties for tab', activeTab, data);
      
      // We need to map `property_images` to `images` because PropertyCard expects `images` property
      const mappedData = data.map((item: any) => ({
        ...item,
        images: item.property_images
      }));
      
      return mappedData as Property[];
    },
    enabled: inView && destinationNames.length > 0, // Only fetch if in view
    staleTime: 0, // Force refetch for debugging
  });

  return (
    <div ref={ref} className="min-h-[250px]">
      <AnimatePresence mode="wait">
        {isLoading && inView ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </motion.div>
        ) : properties && properties.length > 0 ? (
          <motion.div
            key={`properties-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {properties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                variant="overlay"
              />
            ))}
          </motion.div>
        ) : inView ? (
          <motion.div
            key={`empty-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground"
          >
            <p>No featured farm stays available for these locations yet.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
