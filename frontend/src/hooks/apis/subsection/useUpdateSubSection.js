import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateSubSectionRequest } from '@/apis/subsection';

// Callers pass `section` alongside `id`/`title`/etc purely so onSuccess can
// invalidate the right ["subsections", sectionId] query - updateSubSectionRequest
// itself ignores the extra field.
export const useUpdateSubSection = () => {
  const queryClient = useQueryClient();

  const { isPending, error, mutateAsync: updateSubSectionMutation } = useMutation({
    mutationFn: updateSubSectionRequest,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subsections', variables.section] });
      toast.success('Lesson updated successfully');
    },
    onError: (error) => {
      toast.error(error || 'Something went wrong');
    }
  });

  return {
    isPending,
    error,
    updateSubSection: updateSubSectionMutation
  };
};
