
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";

import userRepository from "../repository/userRepository.js";
import { checkOtpRestrictions, sendOtp, trackOtpRequests } from "../utils/common/authHelper.js";
import { clearOtpVerified, createJWT, hashedPassword, isOtpVerified, markOtpVerified, verifyOtp } from "../utils/common/authUtils.js";
import ClientError from "../utils/errors/clientError.js";
import { ValidationError } from "../utils/errors/validationError.js";



// SignUp service
export const signUpService = async (data) => {
  try {
    const existingUser = await userRepository.getByEmail(data.email);
    if(existingUser){
      throw new ClientError({
        message: "User already exists",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["Invalid data sent from the client"],
      })
    }
    await checkOtpRestrictions(data.email);
    await trackOtpRequests(data.email);
    await sendOtp(data.firstName, data.email, 'user-activation-mail');

    return;
  }
  catch (error) {
    // Mongoose validation error (schema validators)
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors },error.message);
    }

    // Duplicate key (unique index) from MongoDB
    // - Could be a direct MongoServerError (error.name === 'MongoServerError' && error.code === 11000)
    // - Or wrapped by Mongoose: error.name === 'MongooseError' and details on error.cause
    const mongoCode = error.code ?? error?.cause?.code;
    if (mongoCode === 11000) {
      // Try to extract the duplicate field name from keyValue (or cause.keyValue)
      const keyVal = error.keyValue ?? error?.cause?.keyValue;
      const field = keyVal ? Object.keys(keyVal)[0] : "field";
      const message = `A user with this ${field} already exists`;

      throw new ValidationError({ error: [message] }, message);
    }

    throw error;
  }
};

// verify user email service

export const verifyUserService = async(data)=>{
  try {
    
    const existingUser = await userRepository.getByEmail(data.email);
    if(existingUser){
      throw new ClientError({
        message: "User already exists",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["Invalid data sent from the client"],
      })
    }

    await verifyOtp(data.email, data.otp);
    // hash the password
    const hashedPass = await hashedPassword(data.password);

    const user = await userRepository.create({...data, password: hashedPass, isVerified: true});

    return user;

  } catch (error) {
     if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors },error.message);
      }
      // Duplicate key (unique index) from MongoDB
    const mongoCode = error.code ?? error?.cause?.code;
    if (mongoCode === 11000) {
      // Try to extract the duplicate field name from keyValue (or cause.keyValue)
      const keyVal = error.keyValue ?? error?.cause?.keyValue;
      const field = keyVal ? Object.keys(keyVal)[0] : "field";
      const message = `A user with this ${field} already exists`;

      throw new ValidationError({ error: [message] }, message);
    }

    throw error;
  }
}


// signIn service


export const signInService = async (data)=>{
  try {
    const user  = await userRepository.getByEmail(data.email);
    if(!user){
      throw new ClientError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid data sent from the client"],
      })
    }

    // match the incoming password with the one in the database;
    const isMatch = await bcrypt.compare(data.password, user.password);
    
    if(!isMatch){
      throw new ClientError({
        message: "Invalid Password",
        statusCode: StatusCodes.UNAUTHORIZED,
        explanation: ["Invalid data sent from the client"],
      })
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      token: createJWT({id: user._id, email: user.email})
    }


  } catch (error) {
    console.log('User Service error', error);
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors },error.message);
    }
    throw error;
  }
}


// forgot password service

export const forgotPasswordService = async(data)=>{
  const {email} = data;
  try {
    const user = await userRepository.getByEmail(email);
    if(!user){
      throw new ClientError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid data sent from the client"]
      })
    }

    await checkOtpRestrictions(data.email);
    await trackOtpRequests(data.email);
    await sendOtp(user.firstName, data.email, 'forgot-password-mail');

    return;
  } catch (error) {
    console.log('User Service error', error);
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors },error.message);
    }
    throw error;
  }
}

// verify otp service

export const verifyOtpService = async(data)=>{
  try {
    const {email, otp} = data;
    const user = await userRepository.getByEmail(email);
    if(!user){
      throw new ClientError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid data sent from the client"],
      })
    }
    const otpVerified = await verifyOtp(email, otp);

    if(!otpVerified){
      throw new ClientError({
        message: "Invalid OTP",
        statusCode: StatusCodes.UNAUTHORIZED,
        explanation: ["Invalid data sent from the client"],
      })
    }

    await markOtpVerified(email);

    return otpVerified;
    
  } catch (error) {
    console.log('User Service error', error);
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors },error.message);
    }
    throw error;
  }
}

// change password service

export const changePasswordService = async(data)=>{
  try {
    const {email, password} = data;

    if(!(await isOtpVerified(email))){
      throw new ClientError({
        message: "Please verify your OTP before changing your password",
        statusCode: StatusCodes.UNAUTHORIZED,
        explanation: ["OTP verification required"],
      })
    }

    const user = await userRepository.getByEmail(email);
    if(!user){
      throw new ClientError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid data sent from the client"],
      })
    }
    // hash the password
    const hashedPass = await hashedPassword(password);

    const updatedUser = await userRepository.update(user._id, {password: hashedPass});

    await clearOtpVerified(email);

    return updatedUser;
  } catch (error) {
    console.log('User Service error', error);
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors },error.message);
    }
    throw error;
  }
}



// reset password service

export const resetPasswordService = async(data, userId)=>{
  try {
    const {oldPassword, newPassword} = data;
    const user = await userRepository.getById(userId);
    if(!user){
      throw new ClientError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
        explanation: ["Invalid data sent from the client"],
      })
    }

    // Old password must match current hash

    const oldMatches = await bcrypt.compare(oldPassword, user.password);
    if(!oldMatches){
      throw new ClientError({
        message: "Old password is incorrect",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["Invalid data sent from the client"],
      })
    }

    // new password must be different from current password
    const newMatches = await bcrypt.compare(newPassword, user.password);
    if(newMatches){
      throw new ClientError({
        message: "New password cannot be same as old password",
        statusCode: StatusCodes.BAD_REQUEST,
        explanation: ["Invalid data sent from the client"],
      })
    }

    // hash the new passowrd
    const hashPass = await hashedPassword(newPassword);
    const updatedUser = await userRepository.update(user._id, {password: hashPass});
    return updatedUser;
    
  } catch (error) {
    console.log('User Service error', error);
    if (error.name === "ValidationError") {
      throw new ValidationError({ error: error.errors },error.message);
    }
    throw error;
  }
}

