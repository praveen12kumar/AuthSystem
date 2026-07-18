import { Pencil, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import ReviewForm from '@/components/organisms/course/ReviewForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star
        key={value}
        className={cn(
          'size-3.5',
          value <= rating ? 'fill-chart-4 text-chart-4' : 'text-muted-foreground'
        )}
      />
    ))}
  </div>
);

const CourseReviews = ({
  reviews,
  isLoading,
  canReview,
  currentUserId,
  onCreate,
  onUpdate,
  onDelete,
  isSubmitting,
  isDeleting
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const myReview = reviews.find((review) => review.user === currentUserId);
  const otherReviews = reviews.filter((review) => review.user !== currentUserId);

  const handleSubmit = async (rating, comment) => {
    if (myReview) {
      await onUpdate(myReview._id, rating, comment);
    } else {
      await onCreate(rating, comment);
    }
    setIsEditing(false);
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <Badge variant="outline">{reviews.length}</Badge>
      </div>

      {canReview && (
        <div className="mb-4 rounded-lg border p-4">
          {myReview && !isEditing ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <StarRating rating={myReview.rating} />
                {myReview.comment && (
                  <p className="mt-2 text-sm">{myReview.comment}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Delete your review"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your review?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeleting}
                        onClick={() => onDelete(myReview._id)}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium">
                {myReview ? 'Edit your review' : 'Write a review'}
              </p>
              <ReviewForm
                initialRating={myReview?.rating || 0}
                initialComment={myReview?.comment || ''}
                onSubmit={handleSubmit}
                isPending={isSubmitting}
              />
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : otherReviews.length === 0 && !myReview ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {otherReviews.map((review) => (
            <div key={review._id} className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                  <AvatarFallback>{review.reviewerName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{review.reviewerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="ml-auto">
                  <StarRating rating={review.rating} />
                </div>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CourseReviews;
