import { useQuery } from '@tanstack/react-query';

import { getCourseProgressRequest } from '@/apis/courseProgress';

export const useCourseProgress = (courseId) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['course-progress', courseId],
        queryFn: () => getCourseProgressRequest({ course: courseId }),
        enabled: !!courseId
    });

    return {
        progress: data?.data || { completedSubSections: [], totalLessons: 0, completedCount: 0, percent: 0 },
        isLoading,
        error
    };
};
