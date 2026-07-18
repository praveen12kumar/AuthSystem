import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/molecules/header/Header';
import CourseDetail from '@/components/organisms/course/CourseDetail';
import { useCourse } from '@/hooks/apis/course/useCourse';
import { useCreateOrder } from '@/hooks/apis/payment/useCreateOrder';
import { useVerifyPayment } from '@/hooks/apis/payment/useVerifyPayment';
import { useCreateReview } from '@/hooks/apis/review/useCreateReview';
import { useDeleteReview } from '@/hooks/apis/review/useDeleteReview';
import { useReviews } from '@/hooks/apis/review/useReviews';
import { useUpdateReview } from '@/hooks/apis/review/useUpdateReview';
import { useSections } from '@/hooks/apis/section/useSections';
import { useTags } from '@/hooks/apis/tag/useTags';
import { useAuth } from '@/hooks/conext/useAuth';
import { loadRazorpayScript } from '@/utils/loadRazorpayScript';

const CourseDetailContainer = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const { course, isLoading: courseLoading, error } = useCourse(id);
  const { sections, isLoading: sectionsLoading } = useSections(id);
  const { tags } = useTags();
  const { createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { verifyPayment, isPending: isVerifying } = useVerifyPayment();
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

  const handleEnroll = async () => {
    if (!auth.user) {
      navigate('/auth/signin');
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Could not load the payment gateway. Check your connection and try again.');
      return;
    }

    let order;
    try {
      const response = await createOrder({ course: course._id });
      order = response.data;
    } catch {
      return; // toast already handled in useCreateOrder
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'LMS',
      description: course.title,
      prefill: {
        name: `${auth.user.firstName} ${auth.user.lastName}`,
        email: auth.user.email
      },
      theme: { color: '#6d5ce8' },
      handler: async (checkoutResponse) => {
        try {
          await verifyPayment({ ...checkoutResponse, courseId: course._id });
        } catch {
          // toast already handled in useVerifyPayment
        }
      }
    });

    razorpay.on('payment.failed', () => {
      toast.error('Payment failed - you have not been charged.');
    });

    razorpay.open();
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
        onEnroll={handleEnroll}
        isEnrolling={isCreatingOrder || isVerifying}
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
