import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Review {
  id: string;
  property_id: string;
  reviewer_id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface PropertyRating {
  property_id: string;
  average_rating: number;
  review_count: number;
}

export function usePropertyReviews(propertyId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<PropertyRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    const [reviewsRes, ratingRes] = await Promise.all([
      supabase
        .from('reviews')
        .select('*, reviewer:profiles(full_name, avatar_url)')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false }),
      supabase
        .from('property_ratings')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle(),
    ]);
    if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
    if (ratingRes.data) setRating(ratingRes.data as PropertyRating);
    setIsLoading(false);
  }, [propertyId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { reviews, rating, isLoading, refetch: fetch };
}

export function useCanReview(bookingId: string | null) {
  const [canReview, setCanReview] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!bookingId || !user) return;
    async function check() {
      const { data } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();
      if (data) {
        setExistingReviewId(data.id);
        setCanReview(false);
      } else {
        setExistingReviewId(null);
        setCanReview(true);
      }
    }
    check();
  }, [bookingId, user]);

  return { canReview, existingReviewId };
}

export function useCanReviewProperty(propertyId: string) {
  const [canReview, setCanReview] = useState(false);
  const [eligibleBookingId, setEligibleBookingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!propertyId || !user) return;
    async function check() {
      // Find all completed bookings for this user on this property
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('property_id', propertyId)
        .eq('guest_id', user.id)
        .eq('status', 'completed');

      if (!bookings || bookings.length === 0) {
        setCanReview(false);
        setEligibleBookingId(null);
        return;
      }

      // Check which of these bookings already have a review
      const bookingIds = bookings.map(b => b.id);
      const { data: reviews } = await supabase
        .from('reviews')
        .select('booking_id')
        .in('booking_id', bookingIds);
      
      const reviewedBookingIds = new Set(reviews?.map(r => r.booking_id) || []);
      
      // Find the first completed booking that hasn't been reviewed
      const unreviewedBooking = bookings.find(b => !reviewedBookingIds.has(b.id));

      if (unreviewedBooking) {
        setCanReview(true);
        setEligibleBookingId(unreviewedBooking.id);
      } else {
        setCanReview(false);
        setEligibleBookingId(null);
      }
    }
    check();
  }, [propertyId, user]);

  return { canReview, eligibleBookingId };
}

export function useCreateReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: {
    property_id: string;
    booking_id: string;
    rating: number;
    comment?: string;
  }) => {
    setIsSubmitting(true);
    setError(null);
    const { data: result, error: err } = await supabase
      .from('reviews')
      .insert(data)
      .select()
      .single();
    setIsSubmitting(false);
    if (err) {
      setError(err.message);
      return null;
    }
    return result;
  }, []);

  return { submit, isSubmitting, error };
}
