import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview } from '@/hooks/useReviews';
import { toast } from 'sonner';

interface SubmitReviewFormProps {
  propertyId: string;
  bookingId: string;
  onSuccess?: () => void;
}

export function SubmitReviewForm({ propertyId, bookingId, onSuccess }: SubmitReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const { submit, isSubmitting, error } = useCreateReview();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    const result = await submit({ property_id: propertyId, booking_id: bookingId, rating, comment: comment.trim() || undefined });
    if (result) {
      toast.success('Review submitted! Thank you.');
      onSuccess?.();
    } else {
      toast.error(error ?? 'Failed to submit review.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star picker */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Your rating</p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const filled = value <= (hovered || rating);
            return (
              <motion.button
                key={i}
                type="button"
                whileTap={{ scale: 0.85 }}
                className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`Rate ${value} stars`}
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    filled ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
                  }`}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Share your experience <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell future travelers what made this farm stay special..."
          className="resize-none min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{comment.length}/500</p>
      </div>

      <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full">
        {isSubmitting ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  );
}
