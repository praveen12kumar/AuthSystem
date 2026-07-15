import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { createTagRequest } from '@/apis/tag';

export const useCreateTag = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: createTagMutation } = useMutation({
        mutationFn: createTagRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            toast.success('Tag created successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        createTag: createTagMutation
    };
};
