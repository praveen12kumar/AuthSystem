import { useQuery } from '@tanstack/react-query';

import { getAllUsersRequest } from '@/apis/auth';

export const useAllUsers = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsersRequest
    });

    return {
        users: data?.data || [],
        isLoading,
        error
    };
};
