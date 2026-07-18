import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { deleteTagRequest } from '@/apis/tag';

export const useDeleteTag = () => {
    const queryClient = useQueryClient();

    const { isPending, mutateAsync: deleteTagMutation } = useMutation({
        mutationFn: deleteTagRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            toast.success('Tag deleted successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        deleteTag: deleteTagMutation
    };
};
