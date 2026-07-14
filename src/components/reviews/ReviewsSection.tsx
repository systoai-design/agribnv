import { useState } from 'react';
import { Star } from 'lucide-react';
import { usePropertyReviews, useCanReviewProperty } from '@/hooks/useReviews';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SubmitReviewForm } from './SubmitReviewForm';

interface ReviewsSectionProps {
  propertyId: string;
}

export function ReviewsSection({ propertyId }: ReviewsSectionProps) {
  const { reviews, rating, isLoading, refetch } = usePropertyReviews(propertyId);
  const { canReview, eligibleBookingId } = useCanReviewProperty(propertyId);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Rating summary & Review Button */}
      <div className="flex items-center justify-between mb-6">
        {rating && rating.review_count > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-bold text-foreground">{rating.average_rating}</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <span className="text-muted-foreground text-sm">
              {rating.review_count} {rating.review_count === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        ) : (
          <div /> // Placeholder for flex layout
        )}
        
        {canReview && eligibleBookingId && (
          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Star className="h-3.5 w-3.5" />
                Leave a review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Review your stay</DialogTitle>
              </DialogHeader>
              <SubmitReviewForm
                propertyId={propertyId}
                bookingId={eligibleBookingId}
                onSuccess={() => {
                  setReviewOpen(false);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <Star className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
