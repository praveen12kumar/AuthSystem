import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateTagRequest } from '@/apis/tag';

export const useUpdateTag = () => {
    const queryClient = useQueryClient();

    const { isPending, mutateAsync: updateTagMutation } = useMutation({
        mutationFn: updateTagRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            toast.success('Tag updated successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        updateTag: updateTagMutation
    };
};
