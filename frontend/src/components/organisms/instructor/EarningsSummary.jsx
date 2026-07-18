import { motion as Motion } from 'framer-motion';
import { IndianRupee, ShoppingCart, Wallet } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const formatINR = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

const EarningsSummary = ({ earnings, isLoading }) => {
  const sortedCourses = [...(earnings.courses || [])].sort(
    (a, b) => b.totalEarnings - a.totalEarnings
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="mt-1 text-muted-foreground">
          Your revenue after the platform's commission on each sale
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total earnings</p>
                  <p className="text-2xl font-bold">
                    {formatINR(earnings.totalEarnings)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total sales</p>
                  <p className="text-2xl font-bold">{earnings.totalSales}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="mb-3 text-lg font-semibold">By course</h2>
          {sortedCourses.length === 0 ? (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              You don't have any published courses yet.
            </div>
          ) : (
            <Motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {sortedCourses.map((course) => (
                <Motion.div key={course.course} variants={itemVariants}>
                  <Card className="overflow-hidden py-0">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:w-32">
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="size-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold tracking-tight">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {course.salesCount} sale{course.salesCount === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <IndianRupee className="size-4" />
                        {(course.totalEarnings || 0).toLocaleString('en-IN')}
                      </div>
                    </CardContent>
                  </Card>
                </Motion.div>
              ))}
            </Motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default EarningsSummary;
