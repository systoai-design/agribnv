import { Star } from 'lucide-react';
import { usePropertyReviews } from '@/hooks/useReviews';
import { ReviewCard } from './ReviewCard';

interface ReviewsSectionProps {
  propertyId: string;
}

export function ReviewsSection({ propertyId }: ReviewsSectionProps) {
  const { reviews, rating, isLoading } = usePropertyReviews(propertyId);

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
      {/* Rating summary */}
      {rating && rating.review_count > 0 ? (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-bold text-foreground">{rating.average_rating}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <span className="text-muted-foreground text-sm">
            {rating.review_count} {rating.review_count === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      ) : null}

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
