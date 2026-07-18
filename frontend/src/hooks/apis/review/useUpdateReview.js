import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateReviewRequest } from '@/apis/review';

// Callers pass `courseId` alongside the real payload purely so onSuccess can
// invalidate the right ["reviews", courseId]/["course", courseId] keys -
// updateReviewRequest itself ignores the extra field.
export const useUpdateReview = () => {
    const queryClient = useQueryClient();

    const { isPending, mutateAsync: updateReviewMutation } = useMutation({
        mutationFn: updateReviewRequest,
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.courseId] });
            queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
            toast.success('Review updated successfully');
        },
        onError: (error) => {
            toast.error(error || 'Could not update review');
        }
    });

    return {
        isPending,
        updateReview: updateReviewMutation
    };
};
