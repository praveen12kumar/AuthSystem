import axios from '../../config/axiosConfig.js';

const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || 'Something went wrong';

export const getSubSectionsBySectionRequest = async ({ section }) => {
    try {
        const response = await axios.get('/api/v1/subsections', { params: { section } });
        return response.data;
    } catch (error) {
        console.log('error fetching lessons', error);
        throw getErrorMessage(error);
    }
};

export const createSubSectionRequest = async ({ title, description, section, video }) => {
    try {
        const formData = new FormData();
        formData.append('title', title);
        if (description) formData.append('description', description);
        formData.append('section', section);
        formData.append('video', video);

        const response = await axios.post('/api/v1/subsections', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.log('error creating lesson', error);
        throw getErrorMessage(error);
    }
};

export const updateSubSectionRequest = async ({ id, title, description, video }) => {
    try {
        const formData = new FormData();
        if (title !== undefined) formData.append('title', title);
        if (description !== undefined) formData.append('description', description);
        if (video) formData.append('video', video);

        const response = await axios.put(`/api/v1/subsections/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.log('error updating lesson', error);
        throw getErrorMessage(error);
    }
};

export const deleteSubSectionRequest = async ({ id }) => {
    try {
        const response = await axios.delete(`/api/v1/subsections/${id}`);
        return response.data;
    } catch (error) {
        console.log('error deleting lesson', error);
        throw getErrorMessage(error);
    }
};
