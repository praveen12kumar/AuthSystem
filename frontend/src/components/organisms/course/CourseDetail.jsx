import { motion as Motion } from 'framer-motion';
import { Layers, Pencil, ShoppingCart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import LessonList from '@/components/organisms/course/LessonList';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CourseDetail = ({
  course,
  sections,
  tagMap,
  isLoading,
  sectionsLoading,
  error,
  isOwner
}) => {
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="text-xl font-semibold">Course not found</h2>
        <p className="mt-2 text-muted-foreground">
          {error || 'This course doesn\'t exist or was removed.'}
        </p>
        <Button asChild className="mt-6">
          <Link to="/courses">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  const hasDiscount = course.discount > 0;
  const finalPrice = hasDiscount
    ? course.price - (course.price * course.discount) / 100
    : course.price;

  const handleEnroll = () => {
    toast('Enrollment & payments are coming soon!', { icon: '🚧' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-8 overflow-hidden rounded-2xl"
      >
        <div className="aspect-[21/9] w-full bg-muted sm:aspect-[3/1]">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="size-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
          <div className="flex flex-wrap gap-1.5">
            {course.tags?.map((tagId) => (
              <Badge key={tagId} variant="secondary">
                {tagMap[tagId] || 'Tag'}
              </Badge>
            ))}
          </div>
          <h1 className="max-w-2xl text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            {course.title}
          </h1>
          <div className="flex items-center gap-1.5 text-white/90">
            <Star className="size-4 fill-chart-4 text-chart-4" />
            <span className="font-medium">
              {course.averageRating?.toFixed(1) || 'New'}
            </span>
            {course.numberOfRatings > 0 && (
              <span className="text-sm text-white/70">
                ({course.numberOfRatings} ratings)
              </span>
            )}
            <span className="text-sm text-white/70">
              · {course.studentsEnrolled?.length || 0} students
            </span>
          </div>
        </div>
      </Motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-xl font-semibold">About this course</h2>
            <p className="whitespace-pre-line text-muted-foreground">
              {course.description}
            </p>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">Curriculum</h2>
              <Badge variant="outline">{sections.length} sections</Badge>
            </div>

            {sectionsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : sections.length === 0 ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                The curriculum for this course hasn't been published yet.
              </div>
            ) : (
              <Accordion type="multiple" className="rounded-lg border px-4">
                {sections.map((section, index) => (
                  <AccordionItem key={section._id} value={section._id}>
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {section.title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <LessonList sectionId={section._id} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  ${finalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-muted-foreground line-through">
                    ${course.price}
                  </span>
                )}
              </div>
              <Button size="lg" onClick={handleEnroll}>
                <ShoppingCart /> Enroll Now
              </Button>
              {isOwner && (
                <Button asChild size="lg" variant="outline">
                  <Link to={`/instructor/courses/${course._id}/edit`}>
                    <Pencil /> Manage this course
                  </Link>
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Full lifetime access · Learn at your own pace
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
