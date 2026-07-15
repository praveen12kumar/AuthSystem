import { useQuery } from '@tanstack/react-query';

import { getAllTagsRequest } from '@/apis/tag';

export const useTags = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['tags'],
        queryFn: getAllTagsRequest
    });

    return {
        tags: data?.data || [],
        isLoading,
        error
    };
};
