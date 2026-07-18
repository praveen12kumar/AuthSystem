import { motion as Motion } from 'framer-motion';
import {
  ChevronRight,
  Layers,
  Lock,
  Pencil,
  PlayCircle,
  ShoppingCart,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

import CourseReviews from '@/components/organisms/course/CourseReviews';
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
  isOwner,
  isEnrolled,
  onEnroll,
  isEnrolling,
  reviews,
  reviewsLoading,
  canReview,
  currentUserId,
  onCreateReview,
  onUpdateReview,
  onDeleteReview,
  isSubmittingReview,
  isDeletingReview
}) => {
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
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
  const canViewLessons = isOwner || isEnrolled;
  const totalLessons = sections.reduce(
    (sum, section) => sum + (section.subSections?.length || 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/courses" className="hover:text-foreground">
          Courses
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-foreground">{course.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 lg:col-span-2"
        >
          <div className="flex flex-wrap gap-1.5">
            {course.tags?.map((tagId) => (
              <Badge key={tagId} variant="secondary">
                {tagMap[tagId] || 'Tag'}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {course.title}
          </h1>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star className="size-4 fill-chart-4 text-chart-4" />
            <span className="font-medium text-foreground">
              {course.averageRating?.toFixed(1) || 'New'}
            </span>
            {course.numberOfRatings > 0 && <span>({course.numberOfRatings} ratings)</span>}
            <span>· {course.studentsEnrolled?.length || 0} students</span>
          </div>

          <p className="whitespace-pre-line text-muted-foreground">
            {course.description}
          </p>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">Syllabus</h2>
              <Badge variant="outline">
                {sections.length} section{sections.length === 1 ? '' : 's'} ·{' '}
                {totalLessons} lesson{totalLessons === 1 ? '' : 's'}
              </Badge>
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
                        <span className="text-xs font-normal text-muted-foreground">
                          {section.subSections?.length || 0} lesson
                          {section.subSections?.length === 1 ? '' : 's'}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {canViewLessons ? (
                        <LessonList sectionId={section._id} courseId={course._id} />
                      ) : (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="size-4" />
                          Enroll to unlock this section&apos;s lessons
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </section>

          <CourseReviews
            reviews={reviews}
            isLoading={reviewsLoading}
            canReview={canReview}
            currentUserId={currentUserId}
            onCreate={onCreateReview}
            onUpdate={onUpdateReview}
            onDelete={onDeleteReview}
            isSubmitting={isSubmittingReview}
            isDeleting={isDeletingReview}
          />
        </Motion.div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 gap-4 overflow-hidden py-0">
            <div className="aspect-video w-full bg-muted">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="size-full object-cover"
              />
            </div>
            <CardContent className="flex flex-col gap-4 p-4">
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
              {isEnrolled ? (
                <Button asChild size="lg">
                  <Link to={`/courses/${course._id}/learn`}>
                    <PlayCircle /> Continue Learning
                  </Link>
                </Button>
              ) : (
                <Button size="lg" onClick={onEnroll} disabled={isEnrolling}>
                  <ShoppingCart />
                  {isEnrolling ? 'Processing...' : 'Enroll Now'}
                </Button>
              )}
              {isOwner && (
                <Button asChild size="lg" variant="outline">
                  <Link to={`/instructor/courses/${course._id}/edit`}>
                    <Pencil /> Manage this course
                  </Link>
                </Button>
              )}
              <div className="space-y-1 border-t pt-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">This course includes:</p>
                <p>
                  {totalLessons} lesson{totalLessons === 1 ? '' : 's'} across{' '}
                  {sections.length} section{sections.length === 1 ? '' : 's'}
                </p>
                <p>Full lifetime access · Learn at your own pace</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
