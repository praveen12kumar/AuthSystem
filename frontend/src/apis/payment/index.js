import axios from '../../config/axiosConfig.js';

const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || 'Something went wrong';

export const createOrderRequest = async ({ course }) => {
    try {
        const response = await axios.post('/api/v1/payments/orders', { course });
        return response.data;
    } catch (error) {
        console.log('error creating order', error);
        throw getErrorMessage(error);
    }
};

export const getMyPaymentsRequest = async () => {
    try {
        const response = await axios.get('/api/v1/payments/my');
        return response.data;
    } catch (error) {
        console.log('error fetching purchases', error);
        throw getErrorMessage(error);
    }
};

export const getEarningsSummaryRequest = async () => {
    try {
        const response = await axios.get('/api/v1/payments/earnings');
        return response.data;
    } catch (error) {
        console.log('error fetching earnings', error);
        throw getErrorMessage(error);
    }
};

export const verifyPaymentRequest = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
}) => {
    try {
        const response = await axios.post('/api/v1/payments/verify', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });
        return response.data;
    } catch (error) {
        console.log('error verifying payment', error);
        throw getErrorMessage(error);
    }
};
