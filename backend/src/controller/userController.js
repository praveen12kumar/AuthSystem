import { StatusCodes } from 'http-status-codes';

import {
  changePasswordService,
  forgotPasswordService,
  getMyProfileService,
  resetPasswordService,
  signInService,
  signUpService,
  updateProfileService,
  verifyOtpService,
  verifyUserService
} from '../services/userService.js';
import {
  customErrorResponse,
  internalErrorResponse,
  successResponse
} from '../utils/common/responseObject.js';

//signup
export const signup = async (req, res) => {
  try {
    await signUpService(req.body);
    return res
      .status(StatusCodes.OK)
      .json(
        successResponse({}, 'Please check your email to verify your account')
      );
  } catch (error) {
    //console.log("user Controller error", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// verify email
export const verifyEmail = async (req, res) => {
  try {
    const response = await verifyUserService(req.body);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'User verified successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// signin
export const signin = async (req, res) => {
  try {
    const response = await signInService(req.body);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'User signed in successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// forgot password
export const forgotPassword = async (req, res) => {
  try {
    await forgotPasswordService(req.body);
    //console.log("forgot password response",response);
    return res
      .status(StatusCodes.OK)
      .json(
        successResponse({}, 'OTP send to email. Please check your account')
      );
  } catch (error) {
    console.log('user Controller forgot password error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// verify Otp
export const verifyOtp = async (req, res) => {
  try {
    const response = await verifyOtpService(req.body);
    console.log('verify otp response', response);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'OTP verified successfully'));
  } catch (error) {
    console.log('user Controller verify otp error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// change Password
export const changePassword = async (req, res) => {
  try {
    const response = await changePasswordService(req.body);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Password changed successfully'));
  } catch (error) {
    console.log('user Controller change password error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// reset Password
export const resetPassword = async (req, res) => {
  const userId = req.user.id;
  try {
    const response = await resetPasswordService(req.body, userId);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Password reset successfully'));
  } catch (error) {
    console.log('user Controller reset password error', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// get my profile
export const getMyProfile = async (req, res) => {
  try {
    const response = await getMyProfileService(req.user.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Profile fetched successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

// update my profile
export const updateProfile = async (req, res) => {
  try {
    const response = await updateProfileService(req.user.id, req.body, req.file);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, 'Profile updated successfully'));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

//TODO: end point for send otp
