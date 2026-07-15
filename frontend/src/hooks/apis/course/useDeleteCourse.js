import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { deleteCourseRequest } from '@/apis/course';

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: deleteCourseMutation } = useMutation({
        mutationFn: deleteCourseRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success('Course deleted successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        deleteCourse: deleteCourseMutation
    };
};
