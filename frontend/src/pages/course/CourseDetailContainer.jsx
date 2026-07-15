import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Header from '@/components/molecules/header/Header';
import CourseDetail from '@/components/organisms/course/CourseDetail';
import { useCourse } from '@/hooks/apis/course/useCourse';
import { useSections } from '@/hooks/apis/section/useSections';
import { useTags } from '@/hooks/apis/tag/useTags';
import { useAuth } from '@/hooks/conext/useAuth';

const CourseDetailContainer = () => {
  const { id } = useParams();
  const { auth } = useAuth();

  const { course, isLoading: courseLoading, error } = useCourse(id);
  const { sections, isLoading: sectionsLoading } = useSections(id);
  const { tags } = useTags();

  const tagMap = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag._id, tag.name])),
    [tags]
  );

  const isOwner =
    auth.user &&
    course &&
    (String(course.instructor) === auth.user.id || auth.user.role === 'ADMIN');

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
      />
    </div>
  );
};

export default CourseDetailContainer;
