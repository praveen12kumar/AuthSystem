import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { verifyPaymentRequest } from '@/apis/payment';

// Callers pass `courseId` alongside the razorpay_* fields purely so onSuccess
// can invalidate the right ["course", courseId] query - verifyPaymentRequest
// itself ignores the extra field.
export const useVerifyPayment = () => {
    const queryClient = useQueryClient();

    const { isPending, error, mutateAsync: verifyPaymentMutation } = useMutation({
        mutationFn: verifyPaymentRequest,
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
            toast.success('Enrolled successfully! Happy learning.');
        },
        onError: (error) => {
            toast.error(error || 'Payment verification failed');
        }
    });

    return {
        isPending,
        error,
        verifyPayment: verifyPaymentMutation
    };
};
