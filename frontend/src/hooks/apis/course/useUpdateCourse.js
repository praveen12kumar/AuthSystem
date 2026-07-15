import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateCourseRequest } from '@/apis/course';

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: updateCourseMutation } = useMutation({
        mutationFn: updateCourseRequest,
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
            toast.success('Course updated successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        updateCourse: updateCourseMutation
    };
};
