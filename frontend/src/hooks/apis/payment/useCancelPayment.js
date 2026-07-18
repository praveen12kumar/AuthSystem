import { useMutation } from '@tanstack/react-query';

import { cancelPaymentRequest } from '@/apis/payment';

// Best-effort cleanup for an abandoned checkout (widget dismissed, or a
// payment.failed event) - silent on both success and failure, since the
// user already saw their own toast (or none, if they just closed the
// widget) and doesn't need to know about this background bookkeeping call.
export const useCancelPayment = () => {
    const { mutate: cancelPayment } = useMutation({
        mutationFn: cancelPaymentRequest
    });

    return { cancelPayment };
};
