import { useQuery } from '@tanstack/react-query';

import { getAllCoursesRequest } from '@/apis/course';

export const useCourses = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['courses'],
        queryFn: getAllCoursesRequest
    });

    return {
        courses: data?.data || [],
        isLoading,
        error
    };
};
