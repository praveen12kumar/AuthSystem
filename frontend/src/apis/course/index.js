import axios from '../../config/axiosConfig.js';

const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || 'Something went wrong';

// Course create/update always go through multipart/form-data since thumbnail
// is an optional/required file alongside text fields - tags must be a
// JSON-encoded string, matching the backend's z.preprocess() expectation.
const buildCourseFormData = ({ title, description, price, discount, tags, thumbnail }) => {
    const formData = new FormData();
    if (title !== undefined) formData.append('title', title);
    if (description !== undefined) formData.append('description', description);
    if (price !== undefined) formData.append('price', price);
    if (discount !== undefined) formData.append('discount', discount);
    if (tags !== undefined) formData.append('tags', JSON.stringify(tags));
    if (thumbnail) formData.append('thumbnail', thumbnail);
    return formData;
};

export const getAllCoursesRequest = async () => {
    try {
        const response = await axios.get('/api/v1/courses');
        return response.data;
    } catch (error) {
        console.log('error fetching courses', error);
        throw getErrorMessage(error);
    }
};

export const getCourseByIdRequest = async ({ id }) => {
    try {
        const response = await axios.get(`/api/v1/courses/${id}`);
        return response.data;
    } catch (error) {
        console.log('error fetching course', error);
        throw getErrorMessage(error);
    }
};

export const createCourseRequest = async (courseData) => {
    try {
        const response = await axios.post('/api/v1/courses', buildCourseFormData(courseData), {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.log('error creating course', error);
        throw getErrorMessage(error);
    }
};

export const updateCourseRequest = async ({ id, ...courseData }) => {
    try {
        const response = await axios.put(`/api/v1/courses/${id}`, buildCourseFormData(courseData), {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.log('error updating course', error);
        throw getErrorMessage(error);
    }
};

export const deleteCourseRequest = async ({ id }) => {
    try {
        const response = await axios.delete(`/api/v1/courses/${id}`);
        return response.data;
    } catch (error) {
        console.log('error deleting course', error);
        throw getErrorMessage(error);
    }
};
