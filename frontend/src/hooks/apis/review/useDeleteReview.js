import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { deleteReviewRequest } from '@/apis/review';

export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    const { isPending, mutateAsync: deleteReviewMutation } = useMutation({
        mutationFn: deleteReviewRequest,
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.courseId] });
            queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
            toast.success('Review deleted');
        },
        onError: (error) => {
            toast.error(error || 'Could not delete review');
        }
    });

    return {
        isPending,
        deleteReview: deleteReviewMutation
    };
};
