import { ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CheckoutSummary = ({ course, user, phoneNumber, isLoading, onProceed, isProcessing }) => {
  if (isLoading || !course) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const hasDiscount = course.discount > 0;
  const finalPrice = hasDiscount
    ? course.price - (course.price * course.discount) / 100
    : course.price;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        to={`/courses/${course._id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to course
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="size-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${finalPrice.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="text-muted-foreground line-through">
                  ${course.price}
                </span>
                <span className="text-sm font-medium text-primary">
                  {course.discount}% off
                </span>
              </>
            )}
          </div>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {course.description}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Payment Details</h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-muted-foreground">
                {phoneNumber || (
                  <>
                    No phone on file ·{' '}
                    <Link
                      to="/profile"
                      className="text-primary underline underline-offset-2"
                    >
                      add in Profile
                    </Link>
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bill summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product total</span>
                <span>${course.price.toFixed(2)}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-primary">
                  <span>Discount ({course.discount}%)</span>
                  <span>-${(course.price - finalPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total</span>
                <span>${finalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={onProceed} disabled={isProcessing}>
            <CreditCard /> {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You&apos;ll be redirected to Razorpay&apos;s secure checkout to complete
            payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
