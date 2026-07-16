import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { createSubSectionRequest } from '@/apis/subsection';

export const useCreateSubSection = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: createSubSectionMutation } = useMutation({
        mutationFn: createSubSectionRequest,
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['subsections', variables.section] });
            toast.success('Lesson added successfully');
        },
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        createSubSection: createSubSectionMutation
    };
};
