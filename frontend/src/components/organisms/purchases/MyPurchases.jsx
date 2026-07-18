import { motion as Motion } from 'framer-motion';
import { PlayCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

const MyPurchases = ({ purchases, isLoading }) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Purchases</h1>
        <p className="mt-1 text-muted-foreground">
          {isLoading
            ? 'Loading your purchases...'
            : `${purchases.length} course${purchases.length === 1 ? '' : 's'} purchased`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden py-0">
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-20 w-32 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <ShoppingBag className="size-8" />
          <p>You haven&apos;t purchased any courses yet.</p>
          <Button asChild size="sm">
            <Link to="/courses">Explore courses</Link>
          </Button>
        </div>
      ) : (
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {purchases.map(({ payment, course }) => (
            <Motion.div key={payment._id} variants={itemVariants}>
              <Card className="overflow-hidden py-0">
                <CardContent className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-32">
                    {course?.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold tracking-tight">
                      {course?.title || 'Course no longer available'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Purchased on {formatDate(payment.createdAt)} ·{' '}
                      {payment.currency} {payment.amount}
                    </p>
                  </div>
                  {course && (
                    <Button asChild size="sm">
                      <Link to={`/courses/${course._id}/learn`}>
                        <PlayCircle /> Continue Learning
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Motion.div>
          ))}
        </Motion.div>
      )}
    </div>
  );
};

export default MyPurchases;
