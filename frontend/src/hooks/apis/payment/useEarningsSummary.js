import { useQuery } from '@tanstack/react-query';

import { getEarningsSummaryRequest } from '@/apis/payment';

export const useEarningsSummary = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['payments', 'earnings'],
        queryFn: getEarningsSummaryRequest
    });

    return {
        earnings: data?.data || { totalEarnings: 0, totalSales: 0, courses: [] },
        isLoading,
        error
    };
};
