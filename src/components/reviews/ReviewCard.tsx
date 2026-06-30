import { Star } from 'lucide-react';
import { Review } from '@/hooks/useReviews';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const name = review.reviewer?.full_name ?? 'Guest';
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="py-6 border-b border-border last:border-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={review.reviewer?.avatar_url ?? ''} alt={name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-semibold text-sm text-foreground truncate">{name}</p>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>
          {/* Stars */}
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
              />
            ))}
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}
