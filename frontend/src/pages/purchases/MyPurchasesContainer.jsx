import { useMemo } from 'react';

import Header from '@/components/molecules/header/Header';
import MyPurchases from '@/components/organisms/purchases/MyPurchases';
import { useCourses } from '@/hooks/apis/course/useCourses';
import { useMyPayments } from '@/hooks/apis/payment/useMyPayments';

const MyPurchasesContainer = () => {
  const { payments, isLoading: paymentsLoading } = useMyPayments();
  const { courses, isLoading: coursesLoading } = useCourses();

  const courseMap = useMemo(
    () => Object.fromEntries(courses.map((course) => [course._id, course])),
    [courses]
  );

  const purchases = useMemo(
    () =>
      payments.map((payment) => ({
        payment,
        course: courseMap[payment.course]
      })),
    [payments, courseMap]
  );

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <MyPurchases
        purchases={purchases}
        isLoading={paymentsLoading || coursesLoading}
      />
    </div>
  );
};

export default MyPurchasesContainer;
