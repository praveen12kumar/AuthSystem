import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { updateProfileRequest } from '@/apis/auth';

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    const { isPending, mutateAsync: updateProfileMutation } = useMutation({
        mutationFn: updateProfileRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
            toast.success('Profile updated successfully');
        },
        onError: (error) => {
            toast.error(error || 'Could not update profile');
        }
    });

    return {
        isPending,
        updateProfile: updateProfileMutation
    };
};
