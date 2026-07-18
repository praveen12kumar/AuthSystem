import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getSubSectionsBySectionRequest } from '@/apis/subsection';

// Fetches every section's lessons in parallel (one query per section, same
// queryKey shape as useSubSections so the cache is shared with the
// CourseDetail accordion) and flattens them into one ordered list grouped
// by section - the player's sidebar needs every lesson across the whole
// course, not just one section at a time.
export const useCourseLessons = (sections) => {
    const results = useQueries({
        queries: (sections || []).map((section) => ({
            queryKey: ['subsections', section._id],
            queryFn: () => getSubSectionsBySectionRequest({ section: section._id }),
            enabled: !!section._id
        }))
    });

    const isLoading = results.some((result) => result.isLoading);

    const sectionsWithLessons = useMemo(
        () =>
            (sections || []).map((section, index) => ({
                ...section,
                lessons: results[index]?.data?.data || []
            })),
        [sections, results]
    );

    const lessons = useMemo(
        () => sectionsWithLessons.flatMap((section) => section.lessons),
        [sectionsWithLessons]
    );

    return { sectionsWithLessons, lessons, isLoading };
};
