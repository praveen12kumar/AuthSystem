import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { createOrderRequest } from '@/apis/payment';

export const useCreateOrder = () => {
    const { isPending, error, mutateAsync: createOrderMutation } = useMutation({
        mutationFn: createOrderRequest,
        onError: (error) => {
            toast.error(error || 'Something went wrong');
        }
    });

    return {
        isPending,
        error,
        createOrder: createOrderMutation
    };
};
