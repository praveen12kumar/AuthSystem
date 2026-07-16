import { useQuery } from '@tanstack/react-query';

import { getSubSectionsBySectionRequest } from '@/apis/subsection';

export const useSubSections = (sectionId) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['subsections', sectionId],
        queryFn: () => getSubSectionsBySectionRequest({ section: sectionId }),
        enabled: !!sectionId
    });

    return {
        subSections: data?.data || [],
        isLoading,
        error
    };
};
