import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { createSectionRequest } from '@/apis/section';

export const useCreateSection = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: createSectionMutation } = useMutation({
        mutationFn: createSectionRequest,
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sections', variables.course] });
            toast.success('Section added successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        createSection: createSectionMutation
    };
};
