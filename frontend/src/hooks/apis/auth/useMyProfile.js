import { useQuery } from '@tanstack/react-query';

import { getMyProfileRequest } from '@/apis/auth';

export const useMyProfile = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['profile', 'me'],
        queryFn: getMyProfileRequest
    });

    return {
        profile: data?.data || null,
        isLoading,
        error
    };
};
