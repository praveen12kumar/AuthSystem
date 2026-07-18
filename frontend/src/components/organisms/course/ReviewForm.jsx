import { Star } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const ReviewForm = ({ initialRating = 0, initialComment = '', onSubmit, isPending }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    onSubmit(rating, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              className={cn(
                'size-6 transition-colors',
                (hoverRating || rating) >= value
                  ? 'fill-chart-4 text-chart-4'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts on this course (optional)"
        rows={3}
        disabled={isPending}
      />
      <Button type="submit" size="sm" disabled={!rating || isPending}>
        {isPending ? 'Submitting...' : 'Submit review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
