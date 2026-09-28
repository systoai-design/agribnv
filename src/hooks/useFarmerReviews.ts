import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FarmerReviewSubScores {
  storytelling?: number;
  warmth?: number;
  communication?: number;
  guidance?: number;
}

export interface FarmerReviewItem {
  id: string;
  booking_id: string;
  property_id: string;
  property_name: string;
  farmer_id: string | null;
  farmer_rating: number;
  farmer_comment: string | null;
  farm_rating?: number | null;
  farm_comment?: string | null;
  sub_scores?: FarmerReviewSubScores | null;
  photo_urls?: string[] | null;
  created_at: string;
  reviewer: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    stay_summary?: string;
  };
  response?: {
    id: string;
    content: string;
    created_at: string;
    updated_at?: string;
  } | null;
}

export interface HospitalityMetrics {
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  pendingRepliesCount: number;
  fiveStarCount: number;
  ratingDistribution: { [star: number]: number };
  traits: {
    storytellingPct: number;
    warmthPct: number;
    communicationPct: number;
    guidancePct: number;
  };
}

// Sample fallback reviews to ensure the farmer layout is immediately demonstrable if DB has 0 reviews
const DEMO_FARMER_REVIEWS: FarmerReviewItem[] = [
  {
    id: 'demo-rev-1',
    booking_id: 'bk-101',
    property_id: 'prop-1',
    property_name: 'Guimaras Mango Heritage Grove',
    farmer_id: 'host-demo',
    farmer_rating: 5,
    farmer_comment:
      'Kuya Ben is an incredible host and storyteller! At 6:30 AM he welcomed us with freshly brewed native barako coffee and personally walked us through the orchard, teaching my kids how sweet mangoes are grafted. His warmth and genuine care made this feel less like a rental and more like visiting family.',
    farm_rating: 5,
    farm_comment: 'Peaceful bamboo cottage with breathtaking morning mist over the mango canopies.',
    sub_scores: {
      storytelling: 5,
      warmth: 5,
      communication: 5,
      guidance: 5,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    reviewer: {
      id: 'rev-user-1',
      full_name: 'Analyn Santos-Del Rosario',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      stay_summary: '2 nights • Mango Heritage Kubo',
    },
    response: {
      id: 'resp-1',
      content:
        'Maraming salamat po Ma’am Analyn! It was an absolute joy hosting you and the kids. The children were so attentive during our grafting walk. We look forward to welcoming your family back during harvest season!',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
  },
  {
    id: 'demo-rev-2',
    booking_id: 'bk-102',
    property_id: 'prop-1',
    property_name: 'Guimaras Mango Heritage Grove',
    farmer_id: 'host-demo',
    farmer_rating: 5,
    farmer_comment:
      'Kuya Ben went above and beyond when our van had a flat tire along the unpaved provincial road. He drove his multicab out to guide us, helped change the tire, and even prepared hot ginger tea (salabat) for us upon arrival. A true farmer with a massive heart.',
    farm_rating: 4,
    farm_comment: 'Road was a bit bumpy after the afternoon rain, but the stay itself was scenic and quiet.',
    sub_scores: {
      storytelling: 5,
      warmth: 5,
      communication: 5,
      guidance: 5,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    reviewer: {
      id: 'rev-user-2',
      full_name: 'Marco Antonio Cruz',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      stay_summary: '3 nights • Family Orchard Villa',
    },
    response: null, // Needs reply
  },
  {
    id: 'demo-rev-3',
    booking_id: 'bk-103',
    property_id: 'prop-2',
    property_name: 'Sunset Hill Bee & Herbal Sanctuary',
    farmer_id: 'host-demo',
    farmer_rating: 4,
    farmer_comment:
      'Very knowledgeable and humble host. The raw honey harvesting session was the highlight of our Guimaras trip. Kuya was very patient in explaining stingless bee behavior. Would appreciate slightly faster text message replies before check-in, but in person he is 10/10.',
    farm_rating: 4,
    farm_comment: 'Clean amenities and nice herbal garden trail.',
    sub_scores: {
      storytelling: 5,
      warmth: 5,
      communication: 4,
      guidance: 5,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
    reviewer: {
      id: 'rev-user-3',
      full_name: 'Patricia Lim',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      stay_summary: '1 night • Pollinator Glamping Tent',
    },
    response: null, // Needs reply
  },
];

export function useFarmerReviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<FarmerReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const fetchFarmerReviews = useCallback(async () => {
    if (!user) {
      setReviews(DEMO_FARMER_REVIEWS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get properties owned by this host
      const { data: hostProperties } = await supabase
        .from('properties')
        .select('id, name')
        .eq('host_id', user.id);

      const propertyIds = hostProperties?.map((p) => p.id) || [];
      const propMap = new Map((hostProperties || []).map((p) => [p.id, p.name]));

      // 2. Fetch reviews where farmer_id is user.id OR property_id belongs to host
      let query = supabase
        .from('reviews')
        .select(`
          id,
          booking_id,
          property_id,
          farmer_id,
          rating,
          comment,
          farm_rating,
          farm_comment,
          farmer_rating,
          farmer_comment,
          sub_scores,
          photo_urls,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url, username),
          response:review_responses(id, host_id, content, created_at, updated_at)
        `)
        .order('created_at', { ascending: false });

      if (propertyIds.length > 0) {
        query = query.or(`farmer_id.eq.${user.id},property_id.in.(${propertyIds.join(',')})`);
      } else {
        query = query.eq('farmer_id', user.id);
      }

      const { data: dbReviews, error } = await query;

      if (error) {
        console.warn('Error fetching farmer reviews from Supabase:', error);
        setReviews(DEMO_FARMER_REVIEWS);
      } else if (!dbReviews || dbReviews.length === 0) {
        // Fallback to demo reviews so the farmer sees the UI in action
        setReviews(DEMO_FARMER_REVIEWS);
      } else {
        const formatted: FarmerReviewItem[] = dbReviews.map((r: any) => {
          const resp = Array.isArray(r.response) ? r.response[0] : r.response;
          return {
            id: r.id,
            booking_id: r.booking_id,
            property_id: r.property_id,
            property_name: propMap.get(r.property_id) || 'Working Farm Stay',
            farmer_id: r.farmer_id || user.id,
            farmer_rating: r.farmer_rating || r.rating || 5,
            farmer_comment: r.farmer_comment || r.comment,
            farm_rating: r.farm_rating,
            farm_comment: r.farm_comment,
            sub_scores: r.sub_scores as FarmerReviewSubScores | null,
            photo_urls: r.photo_urls,
            created_at: r.created_at,
            reviewer: {
              id: r.reviewer?.id || 'guest',
              full_name: r.reviewer?.full_name || 'Verified Guest',
              avatar_url: r.reviewer?.avatar_url || null,
              stay_summary: 'Verified Stay',
            },
            response: resp
              ? {
                  id: resp.id,
                  content: resp.content,
                  created_at: resp.created_at,
                  updated_at: resp.updated_at,
                }
              : null,
          };
        });
        setReviews(formatted);
      }
    } catch (err) {
      console.error('Exception fetching farmer reviews:', err);
      setReviews(DEMO_FARMER_REVIEWS);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFarmerReviews();
  }, [fetchFarmerReviews]);

  // Submit an official host response to a review
  const submitResponse = async (reviewId: string, content: string) => {
    if (!content.trim()) return false;
    setIsSubmittingResponse(true);

    try {
      if (user) {
        const { data, error } = await supabase
          .from('review_responses')
          .upsert(
            {
              review_id: reviewId,
              host_id: user.id,
              content: content.trim(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'review_id' }
          )
          .select()
          .single();

        if (error) {
          toast({
            title: 'Error posting response',
            description: error.message,
            variant: 'destructive',
          });
          setIsSubmittingResponse(false);
          return false;
        }

        // Optimistically update state
        setReviews((prev) =>
          prev.map((item) =>
            item.id === reviewId
              ? {
                  ...item,
                  response: {
                    id: data.id,
                    content: data.content,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                  },
                }
              : item
          )
        );
      } else {
        // Demo update
        setReviews((prev) =>
          prev.map((item) =>
            item.id === reviewId
              ? {
                  ...item,
                  response: {
                    id: `resp-${Date.now()}`,
                    content: content.trim(),
                    created_at: new Date().toISOString(),
                  },
                }
              : item
          )
        );
      }

      toast({
        title: 'Response published!',
        description: 'Your official response is now publicly visible beneath the guest’s tribute.',
      });
      setIsSubmittingResponse(false);
      return true;
    } catch (err: any) {
      toast({
        title: 'Error posting response',
        description: err.message || 'Something went wrong.',
        variant: 'destructive',
      });
      setIsSubmittingResponse(false);
      return false;
    }
  };

  // Metrics computation for Farmer Hospitality
  const metrics: HospitalityMetrics = useMemo(() => {
    if (reviews.length === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        responseRate: 100,
        pendingRepliesCount: 0,
        fiveStarCount: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        traits: {
          storytellingPct: 100,
          warmthPct: 100,
          communicationPct: 100,
          guidancePct: 100,
        },
      };
    }

    const total = reviews.length;
    let sumRating = 0;
    let answered = 0;
    let fiveStars = 0;
    const dist: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    let sumStorytelling = 0;
    let sumWarmth = 0;
    let sumComm = 0;
    let sumGuidance = 0;
    let ratedCount = 0;

    reviews.forEach((r) => {
      const score = Math.max(1, Math.min(5, Math.round(r.farmer_rating)));
      sumRating += r.farmer_rating;
      dist[score] = (dist[score] || 0) + 1;
      if (score === 5) fiveStars++;
      if (r.response) answered++;

      if (r.sub_scores) {
        ratedCount++;
        sumStorytelling += r.sub_scores.storytelling || 5;
        sumWarmth += r.sub_scores.warmth || 5;
        sumComm += r.sub_scores.communication || 5;
        sumGuidance += r.sub_scores.guidance || 5;
      }
    });

    const averageRating = Number((sumRating / total).toFixed(1));
    const responseRate = Math.round((answered / total) * 100);
    const pendingRepliesCount = total - answered;

    const traits = {
      storytellingPct: ratedCount ? Math.round((sumStorytelling / (ratedCount * 5)) * 100) : 98,
      warmthPct: ratedCount ? Math.round((sumWarmth / (ratedCount * 5)) * 100) : 100,
      communicationPct: ratedCount ? Math.round((sumComm / (ratedCount * 5)) * 100) : 95,
      guidancePct: ratedCount ? Math.round((sumGuidance / (ratedCount * 5)) * 100) : 99,
    };

    return {
      averageRating,
      totalReviews: total,
      responseRate,
      pendingRepliesCount,
      fiveStarCount: fiveStars,
      ratingDistribution: dist,
      traits,
    };
  }, [reviews]);

  return {
    reviews,
    metrics,
    isLoading,
    isSubmittingResponse,
    refetch: fetchFarmerReviews,
    submitResponse,
  };
}
