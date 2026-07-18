import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/molecules/header/Header';
import CoursePlayer from '@/components/organisms/course/CoursePlayer';
import { useCourse } from '@/hooks/apis/course/useCourse';
import { useCourseProgress } from '@/hooks/apis/courseProgress/useCourseProgress';
import { useMarkLessonComplete } from '@/hooks/apis/courseProgress/useMarkLessonComplete';
import { useSections } from '@/hooks/apis/section/useSections';
import { useCourseLessons } from '@/hooks/apis/subsection/useCourseLessons';
import { useAuth } from '@/hooks/conext/useAuth';

const CoursePlayerContainer = () => {
  const { id: courseId, subSectionId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const { course, isLoading: courseLoading } = useCourse(courseId);
  const { sections, isLoading: sectionsLoading } = useSections(courseId);
  const {
    sectionsWithLessons,
    lessons,
    isLoading: lessonsLoading
  } = useCourseLessons(sections);
  const { progress } = useCourseProgress(courseId);
  const { markComplete, isPending: isMarkingComplete } = useMarkLessonComplete();

  const isOwner =
    auth.user &&
    course &&
    (String(course.instructor) === auth.user.id || auth.user.role === 'ADMIN');
  const isEnrolled =
    auth.user &&
    course?.studentsEnrolled?.some((studentId) => String(studentId) === auth.user.id);
  const canView = Boolean(isOwner || isEnrolled);

  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson._id === subSectionId) || lessons[0] || null,
    [lessons, subSectionId]
  );

  useEffect(() => {
    if (!subSectionId && currentLesson) {
      navigate(`/courses/${courseId}/learn/${currentLesson._id}`, { replace: true });
    }
  }, [subSectionId, currentLesson, courseId, navigate]);

  const handleMarkComplete = () => {
    if (!currentLesson) return;
    markComplete({ course: courseId, subSection: currentLesson._id });
  };

  const handleSelectLesson = (lessonId) => {
    navigate(`/courses/${courseId}/learn/${lessonId}`);
  };

  const isLoading = auth.isLoading || courseLoading || sectionsLoading || lessonsLoading;

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <CoursePlayer
        course={course}
        sectionsWithLessons={sectionsWithLessons}
        currentLesson={currentLesson}
        progress={progress}
        isLoading={isLoading}
        canView={canView}
        onMarkComplete={handleMarkComplete}
        isMarkingComplete={isMarkingComplete}
        onSelectLesson={handleSelectLesson}
      />
    </div>
  );
};

export default CoursePlayerContainer;
