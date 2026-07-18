import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { markLessonCompleteRequest } from '@/apis/courseProgress';

export const useMarkLessonComplete = () => {
    const queryClient = useQueryClient();

    const { isPending, mutate: markComplete } = useMutation({
        mutationFn: markLessonCompleteRequest,
        onSuccess: (_response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['course-progress', variables.course] });
        },
        onError: (error) => {
            toast.error(error || 'Could not update progress');
        }
    });

    return { isPending, markComplete };
};
