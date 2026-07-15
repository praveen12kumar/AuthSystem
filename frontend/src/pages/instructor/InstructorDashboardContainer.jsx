import { useMemo } from 'react';

import Header from '@/components/molecules/header/Header';
import InstructorDashboard from '@/components/organisms/instructor/InstructorDashboard';
import { useCourses } from '@/hooks/apis/course/useCourses';
import { useDeleteCourse } from '@/hooks/apis/course/useDeleteCourse';
import { useAuth } from '@/hooks/conext/useAuth';

const InstructorDashboardContainer = () => {
  const { auth } = useAuth();
  const { courses, isLoading } = useCourses();
  const { deleteCourse, isPending: isDeleting } = useDeleteCourse();

  const myCourses = useMemo(() => {
    if (auth.user?.role === 'ADMIN') return courses;
    return courses.filter(
      (course) => String(course.instructor) === auth.user?.id
    );
  }, [courses, auth.user]);

  const handleDelete = async (id) => {
    try {
      await deleteCourse({ id });
    } catch {
      // toast already handled in useDeleteCourse
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <InstructorDashboard
        courses={myCourses}
        isLoading={isLoading}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default InstructorDashboardContainer;
