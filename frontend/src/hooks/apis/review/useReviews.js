import { useQuery } from '@tanstack/react-query';

import { getReviewsByCourseRequest } from '@/apis/review';

export const useReviews = (courseId) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['reviews', courseId],
        queryFn: () => getReviewsByCourseRequest({ course: courseId }),
        enabled: !!courseId
    });

    return {
        reviews: data?.data || [],
        isLoading,
        error
    };
};
