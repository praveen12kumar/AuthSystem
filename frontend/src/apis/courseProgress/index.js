import axios from '../../config/axiosConfig.js';

const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || 'Something went wrong';

export const getCourseProgressRequest = async ({ course }) => {
    try {
        const response = await axios.get('/api/v1/course-progress', { params: { course } });
        return response.data;
    } catch (error) {
        console.log('error fetching progress', error);
        throw getErrorMessage(error);
    }
};

export const markLessonCompleteRequest = async ({ course, subSection }) => {
    try {
        const response = await axios.post('/api/v1/course-progress/complete', {
            course,
            subSection
        });
        return response.data;
    } catch (error) {
        console.log('error marking lesson complete', error);
        throw getErrorMessage(error);
    }
};
