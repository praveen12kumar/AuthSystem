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
