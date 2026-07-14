import { useState } from 'react';
import { Star } from 'lucide-react';
import { usePropertyReviews, useCanReviewProperty } from '@/hooks/useReviews';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SubmitReviewForm } from './SubmitReviewForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ReviewsSectionProps {
  propertyId: string;
}

export function ReviewsSection({ propertyId }: ReviewsSectionProps) {
  const { reviews, rating, isLoading, refetch } = usePropertyReviews(propertyId);
  const { canReview, eligibleBookingId } = useCanReviewProperty(propertyId);
  const [reviewOpen, setReviewOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleReviewClick = (e: React.MouseEvent) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to leave a review.",
      });
      return;
    }
    if (!canReview) {
      e.preventDefault(); // Prevent dialog from opening
      toast({
        title: "Cannot leave a review",
        description: "You can only review properties you have booked and stayed at.",
      });
    }
  };

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
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleReviewClick}>
              <Star className="h-4 w-4" />
              Write a Review
            </Button>
          </DialogTrigger>
          {canReview && eligibleBookingId && (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
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
          )}
        </Dialog>
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
