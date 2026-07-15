import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateSectionRequest } from '@/apis/section';

// Callers pass `course` alongside `id`/`title` purely so onSuccess can
// invalidate the right ["sections", courseId] query - updateSectionRequest
// itself ignores the extra field.
export const useUpdateSection = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: updateSectionMutation } = useMutation({
        mutationFn: updateSectionRequest,
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sections', variables.course] });
            toast.success('Section updated successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        updateSection: updateSectionMutation
    };
};
