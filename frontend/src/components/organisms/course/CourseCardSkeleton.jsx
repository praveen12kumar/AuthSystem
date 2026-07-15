import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CourseCardSkeleton = () => {
  return (
    <Card className="gap-3 overflow-hidden py-0">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardContent className="flex flex-col gap-2 px-4 pb-4">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-14" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCardSkeleton;
