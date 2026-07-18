import { useQuery } from '@tanstack/react-query';

import { getMyPaymentsRequest } from '@/apis/payment';

export const useMyPayments = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['payments', 'my'],
        queryFn: getMyPaymentsRequest
    });

    return {
        payments: data?.data || [],
        isLoading,
        error
    };
};
