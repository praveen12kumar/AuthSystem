import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateUserRoleRequest } from '@/apis/auth';

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    const { isPending, mutateAsync: updateUserRoleMutation } = useMutation({
        mutationFn: updateUserRoleRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Role updated successfully');
        },
        onError: (error) => {
            toast.error(error || 'Could not update role');
        }
    });

    return {
        isPending,
        updateUserRole: updateUserRoleMutation
    };
};
