import axios from '../../config/axiosConfig.js';

const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || 'Something went wrong';

export const getReviewsByCourseRequest = async ({ course }) => {
    try {
        const response = await axios.get('/api/v1/reviews', { params: { course } });
        return response.data;
    } catch (error) {
        console.log('error fetching reviews', error);
        throw getErrorMessage(error);
    }
};

export const createReviewRequest = async ({ course, rating, comment }) => {
    try {
        const response = await axios.post('/api/v1/reviews', { course, rating, comment });
        return response.data;
    } catch (error) {
        console.log('error creating review', error);
        throw getErrorMessage(error);
    }
};

export const updateReviewRequest = async ({ id, rating, comment }) => {
    try {
        const response = await axios.put(`/api/v1/reviews/${id}`, { rating, comment });
        return response.data;
    } catch (error) {
        console.log('error updating review', error);
        throw getErrorMessage(error);
    }
};

export const deleteReviewRequest = async ({ id }) => {
    try {
        const response = await axios.delete(`/api/v1/reviews/${id}`);
        return response.data;
    } catch (error) {
        console.log('error deleting review', error);
        throw getErrorMessage(error);
    }
};
