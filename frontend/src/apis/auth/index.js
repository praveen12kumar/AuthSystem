import axios from '../../config/axiosConfig.js';


const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || "Something went wrong";

export const signUpRequest = async({firstName, lastName, email, password})=>{
    try {
        const response = await axios.post('/api/v1/users/signup', {
            firstName,
            lastName,
            email,
            password
        });

        return response.data;
    } catch (error) {
        console.log("error is signing up",error);
        throw getErrorMessage(error);
    }
}


export const signInRequest = async({email, password})=>{
    try {
        const response = await axios.post('/api/v1/users/signin', {
            email,
            password
        });

        return response.data;
    } catch (error) {
        console.log("error in signing in",error);
        throw getErrorMessage(error);
    }
}


export const verifyEmailRequest = async({firstName, lastName, email, password, otp})=>{
    try {
        const response = await axios.post('/api/v1/users/verify-email', {
            firstName,
            lastName,
            email,
            password,
            otp
        });

        return response.data;

    } catch (error) {
        console.log("error is verifing the email",error);
        throw getErrorMessage(error);
    }
}

export const forgotPasswordRequest = async({email})=>{
    try {
        const response = await axios.post('/api/v1/users/forgot-password', {
            email
        });

        return response.data;

    } catch (error) {
        console.log("error is forgot password",error);
        throw getErrorMessage(error);
    }
}

export const verifyOtpRequest = async({email, otp})=>{
    try {
        const response = await axios.post('/api/v1/users/verify-otp', {
            email,
            otp
        });

        return response.data;

    } catch (error) {
        console.log("error is verifing the otp",error);
        throw getErrorMessage(error);
    }
}


// change password

export const changePasswordRequest = async({email, password})=>{
    try {
        const response = await axios.post('/api/v1/users/change-password', {
            email,
            password
        });

        return response.data;

    } catch (error) {
        console.log("error is changing password",error);
        throw getErrorMessage(error);
    }
};


// reset password

export const resetPasswordRequest = async({oldPassword, newPassword})=>{
    try {
        const response = await axios.post('/api/v1/users/reset-password', {oldPassword, newPassword},{
        });

        return response.data;

    } catch (error) {
        console.log("error is reset password",error);
        throw getErrorMessage(error);
    }
};

// get my profile

export const getMyProfileRequest = async () => {
    try {
        const response = await axios.get('/api/v1/users/me');
        return response.data;
    } catch (error) {
        console.log('error fetching profile', error);
        throw getErrorMessage(error);
    }
};

// update my profile - multipart since avatar is an optional file alongside
// text fields, same shape as course create/update.

export const updateProfileRequest = async ({
    firstName,
    lastName,
    about,
    phoneNumber,
    gender,
    dob,
    avatar
}) => {
    try {
        const formData = new FormData();
        if (firstName !== undefined) formData.append('firstName', firstName);
        if (lastName !== undefined) formData.append('lastName', lastName);
        if (about !== undefined) formData.append('about', about);
        if (phoneNumber !== undefined) formData.append('phoneNumber', phoneNumber);
        // gender/dob are only ever valid as a real value or entirely absent -
        // an empty string fails the backend's enum/date validation, unlike
        // about/phoneNumber where an empty string is a legitimate "cleared" value.
        if (gender) formData.append('gender', gender);
        if (dob) formData.append('dob', dob);
        if (avatar) formData.append('avatar', avatar);

        const response = await axios.put('/api/v1/users/me', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.log('error updating profile', error);
        throw getErrorMessage(error);
    }
};