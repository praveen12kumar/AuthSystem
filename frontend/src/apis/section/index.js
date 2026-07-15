import axios from '../../config/axiosConfig.js';

const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || 'Something went wrong';

export const getSectionsByCourseRequest = async ({ course }) => {
    try {
        const response = await axios.get('/api/v1/sections', { params: { course } });
        return response.data;
    } catch (error) {
        console.log('error fetching sections', error);
        throw getErrorMessage(error);
    }
};

export const createSectionRequest = async ({ title, course }) => {
    try {
        const response = await axios.post('/api/v1/sections', { title, course });
        return response.data;
    } catch (error) {
        console.log('error creating section', error);
        throw getErrorMessage(error);
    }
};

export const updateSectionRequest = async ({ id, title }) => {
    try {
        const response = await axios.put(`/api/v1/sections/${id}`, { title });
        return response.data;
    } catch (error) {
        console.log('error updating section', error);
        throw getErrorMessage(error);
    }
};

export const deleteSectionRequest = async ({ id }) => {
    try {
        const response = await axios.delete(`/api/v1/sections/${id}`);
        return response.data;
    } catch (error) {
        console.log('error deleting section', error);
        throw getErrorMessage(error);
    }
};
