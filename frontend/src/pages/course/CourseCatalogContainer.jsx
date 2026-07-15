import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Header from '@/components/molecules/header/Header';
import CourseCatalog from '@/components/organisms/course/CourseCatalog';
import { useCourses } from '@/hooks/apis/course/useCourses';
import { useTags } from '@/hooks/apis/tag/useTags';

const CourseCatalogContainer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const activeTag = searchParams.get('tag') || null;

  const { courses, isLoading: coursesLoading } = useCourses();
  const { tags, isLoading: tagsLoading } = useTags();

  const tagMap = useMemo(
    () => Object.fromEntries(tags.map((tag) => [tag._id, tag.name])),
    [tags]
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesTag = !activeTag || course.tags?.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [courses, search, activeTag]);

  const handleTagSelect = (tagId) => {
    if (tagId === activeTag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag: tagId });
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <CourseCatalog
        courses={filteredCourses}
        tagMap={tagMap}
        tags={tags}
        activeTag={activeTag}
        onTagSelect={handleTagSelect}
        search={search}
        onSearchChange={setSearch}
        isLoading={coursesLoading || tagsLoading}
      />
    </div>
  );
};

export default CourseCatalogContainer;
