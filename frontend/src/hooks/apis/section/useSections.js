import { useQuery } from '@tanstack/react-query';

import { getSectionsByCourseRequest } from '@/apis/section';

export const useSections = (courseId) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['sections', courseId],
        queryFn: () => getSectionsByCourseRequest({ course: courseId }),
        enabled: !!courseId
    });

    return {
        sections: data?.data || [],
        isLoading,
        error
    };
};
