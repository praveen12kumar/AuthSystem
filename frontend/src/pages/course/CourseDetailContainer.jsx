import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Header from '@/components/molecules/header/Header';
import CourseDetail from '@/components/organisms/course/CourseDetail';
import { useCourse } from '@/hooks/apis/course/useCourse';
import { useCreateReview } from '@/hooks/apis/review/useCreateReview';
import { useDeleteReview } from '@/hooks/apis/review/useDeleteReview';
import { useReviews } from '@/hooks/apis/review/useReviews';
import { useUpdateReview } from '@/hooks/apis/review/useUpdateReview';
import { useSections } from '@/hooks/apis/section/useSections';
import { useTags } from '@/hooks/apis/tag/useTags';
import { useAuth } from '@/hooks/conext/useAuth';

const CourseDetailContainer = () => {
  const { id } = useParams();
  const { auth } = useAuth();

  const { course, isLoading: courseLoading, error } = useCourse(id);
  const { sections, isLoading: sectionsLoading } = useSections(id);
  const { tags } = useTags();
  const { reviews, isLoading: reviewsLoading } = useReviews(id);
  const { createReview, isPending: isCreatingReview } = useCreateReview();
  const { updateReview, isPending: isUpdatingReview } = useUpdateReview();
  const { deleteReview, isPending: isDeletingReview } = useDeleteReview();

  const tagMap = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag._id, tag.name])),
    [tags]
  );

  const isOwner =
    auth.user &&
    course &&
    (String(course.instructor) === auth.user.id || auth.user.role === 'ADMIN');

  const isEnrolled =
    auth.user &&
    course?.studentsEnrolled?.some((studentId) => String(studentId) === auth.user.id);

  const isCourseInstructor =
    auth.user && course && String(course.instructor) === auth.user.id;
  const canReview = Boolean(
    auth.user && !isCourseInstructor && (isEnrolled || auth.user.role === 'ADMIN')
  );

  const handleCreateReview = async (rating, comment) => {
    try {
      await createReview({ course: id, rating, comment });
    } catch {
      // toast already handled in useCreateReview
    }
  };

  const handleUpdateReview = async (reviewId, rating, comment) => {
    try {
      await updateReview({ id: reviewId, rating, comment, courseId: id });
    } catch {
      // toast already handled in useUpdateReview
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview({ id: reviewId, courseId: id });
    } catch {
      // toast already handled in useDeleteReview
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <CourseDetail
        course={course}
        sections={sections}
        tagMap={tagMap}
        isLoading={courseLoading}
        sectionsLoading={sectionsLoading}
        error={error}
        isOwner={isOwner}
        isEnrolled={isEnrolled}
        reviews={reviews}
        reviewsLoading={reviewsLoading}
        canReview={canReview}
        currentUserId={auth.user?.id}
        onCreateReview={handleCreateReview}
        onUpdateReview={handleUpdateReview}
        onDeleteReview={handleDeleteReview}
        isSubmittingReview={isCreatingReview || isUpdatingReview}
        isDeletingReview={isDeletingReview}
      />
    </div>
  );
};

export default CourseDetailContainer;
