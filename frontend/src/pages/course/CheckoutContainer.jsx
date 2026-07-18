import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/molecules/header/Header';
import CheckoutSummary from '@/components/organisms/course/CheckoutSummary';
import { useMyProfile } from '@/hooks/apis/auth/useMyProfile';
import { useCourse } from '@/hooks/apis/course/useCourse';
import { useCreateOrder } from '@/hooks/apis/payment/useCreateOrder';
import { useVerifyPayment } from '@/hooks/apis/payment/useVerifyPayment';
import { useAuth } from '@/hooks/conext/useAuth';
import { loadRazorpayScript } from '@/utils/loadRazorpayScript';

const CheckoutContainer = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const { course, isLoading: courseLoading } = useCourse(id);
  const { profile } = useMyProfile();
  const { createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { verifyPayment, isPending: isVerifying } = useVerifyPayment();

  const isEnrolled =
    course?.studentsEnrolled?.some((studentId) => String(studentId) === auth.user?.id) ??
    false;
  const isCourseInstructor =
    course && auth.user && String(course.instructor) === auth.user.id;

  // A student who already owns this course, or the course's own instructor,
  // has no business being on the checkout page - bounce them somewhere
  // sensible rather than letting them (re-)attempt a purchase the backend
  // would reject anyway.
  useEffect(() => {
    if (!course) return;
    if (isEnrolled) {
      navigate(`/courses/${id}/learn`, { replace: true });
    } else if (isCourseInstructor) {
      navigate(`/courses/${id}`, { replace: true });
    }
  }, [course, isEnrolled, isCourseInstructor, id, navigate]);

  const handleProceedToPayment = async () => {
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
        email: auth.user.email,
        contact: profile?.profile?.phoneNumber || undefined
      },
      theme: { color: '#6d5ce8' },
      handler: async (checkoutResponse) => {
        try {
          await verifyPayment({ ...checkoutResponse, courseId: course._id });
          navigate(`/courses/${course._id}/learn`);
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
      <CheckoutSummary
        course={course}
        user={auth.user}
        phoneNumber={profile?.profile?.phoneNumber}
        isLoading={courseLoading || !auth.user}
        onProceed={handleProceedToPayment}
        isProcessing={isCreatingOrder || isVerifying}
      />
    </div>
  );
};

export default CheckoutContainer;
