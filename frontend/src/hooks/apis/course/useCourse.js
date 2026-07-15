import { useQuery } from '@tanstack/react-query';

import { getCourseByIdRequest } from '@/apis/course';

export const useCourse = (id) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['course', id],
        queryFn: () => getCourseByIdRequest({ id }),
        enabled: !!id
    });

    return {
        course: data?.data || null,
        isLoading,
        error
    };
};
