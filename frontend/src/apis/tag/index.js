import axios from '../../config/axiosConfig.js';

const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || 'Something went wrong';

export const getAllTagsRequest = async () => {
    try {
        const response = await axios.get('/api/v1/tags');
        return response.data;
    } catch (error) {
        console.log('error fetching tags', error);
        throw getErrorMessage(error);
    }
};

export const createTagRequest = async ({ name, description }) => {
    try {
        const response = await axios.post('/api/v1/tags', { name, description });
        return response.data;
    } catch (error) {
        console.log('error creating tag', error);
        throw getErrorMessage(error);
    }
};

export const updateTagRequest = async ({ id, name, description }) => {
    try {
        const response = await axios.put(`/api/v1/tags/${id}`, { name, description });
        return response.data;
    } catch (error) {
        console.log('error updating tag', error);
        throw getErrorMessage(error);
    }
};

export const deleteTagRequest = async ({ id }) => {
    try {
        const response = await axios.delete(`/api/v1/tags/${id}`);
        return response.data;
    } catch (error) {
        console.log('error deleting tag', error);
        throw getErrorMessage(error);
    }
};
