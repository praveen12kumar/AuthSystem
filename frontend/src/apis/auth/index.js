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