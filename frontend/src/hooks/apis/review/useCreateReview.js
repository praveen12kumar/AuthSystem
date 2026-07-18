import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { createReviewRequest } from '@/apis/review';

export const useCreateReview = () => {
    const queryClient = useQueryClient();

    const { isPending, mutateAsync: createReviewMutation } = useMutation({
        mutationFn: createReviewRequest,
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.course] });
            queryClient.invalidateQueries({ queryKey: ['course', variables.course] });
            toast.success('Review posted successfully');
        },
        onError: (error) => {
            toast.error(error || 'Could not post review');
        }
    });

    return {
        isPending,
        createReview: createReviewMutation
    };
};
