import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// tagMap: { [tagId]: tagName } - resolved once by the parent page from the
// full tag list, since Course documents only carry raw tag ids (no populate
// on the backend yet).
const CourseCard = ({ course, tagMap = {}, className }) => {
  const hasDiscount = course.discount > 0;
  const finalPrice = hasDiscount
    ? course.price - (course.price * course.discount) / 100
    : course.price;

  return (
    <Link to={`/courses/${course._id}`} className="block h-full">
      <Card
        className={cn(
          'group h-full gap-3 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
          className
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 right-2" variant="destructive">
              {course.discount}% off
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 px-4 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {course.tags?.slice(0, 2).map((tagId) => (
              <Badge key={tagId} variant="secondary">
                {tagMap[tagId] || 'Tag'}
              </Badge>
            ))}
          </div>
          <h3 className="line-clamp-2 font-semibold tracking-tight">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-sm">
              <Star className="size-4 fill-chart-4 text-chart-4" />
              <span className="font-medium">
                {course.averageRating?.toFixed(1) || 'New'}
              </span>
              {course.numberOfRatings > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({course.numberOfRatings})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  ${course.price}
                </span>
              )}
              <span className="font-bold text-primary">
                ${finalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;
