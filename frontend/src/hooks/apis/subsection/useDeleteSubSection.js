import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { deleteSubSectionRequest } from '@/apis/subsection';

// See useUpdateSubSection.js - `section` is passed alongside `id` only for
// query-invalidation purposes.
export const useDeleteSubSection = () => {
  const queryClient = useQueryClient();

  const { isPending, error, mutateAsync: deleteSubSectionMutation } = useMutation({
    mutationFn: deleteSubSectionRequest,
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subsections', variables.section] });
      toast.success('Lesson deleted successfully');
    },
    onError: (error) => {
      toast.error(error || 'Something went wrong');
    }
  });

  return {
    isPending,
    error,
    deleteSubSection: deleteSubSectionMutation
  };
};
