import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { createCourseRequest } from '@/apis/course';

export const useCreateCourse = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: createCourseMutation } = useMutation({
        mutationFn: createCourseRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success('Course created successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        createCourse: createCourseMutation
    };
};
