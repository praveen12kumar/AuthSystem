import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { deleteSectionRequest } from '@/apis/section';

// See useUpdateSection.js - `course` is passed alongside `id` only for
// query-invalidation purposes.
export const useDeleteSection = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: deleteSectionMutation } = useMutation({
        mutationFn: deleteSectionRequest,
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sections', variables.course] });
            toast.success('Section deleted successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        deleteSection: deleteSectionMutation
    };
};
