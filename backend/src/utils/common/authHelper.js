import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';

import { sendEmail } from '../../config/nodemailer.js';
import redis from '../../libs/redisConfig.js'
import ClientError from '../errors/clientError.js';

export const checkOtpRestrictions = async(email)=>{
//console.log("Checking otp restrictions");
if(await redis.get(`otp_lock:${email}`)){
    throw new ClientError({
        message: "Too many attempts, please wait 3 minutes before trying again.",
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        explanation: ["Invalid data sent from the client"],
    })
}

if(await redis.get(`otp_spam_lock:${email}`)){
    throw new ClientError({
        message: "Too many attempts, please wait 1 hour before trying again.",
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        explanation: ["Invalid data sent from the client"],
    })
}

if(await redis.get(`otp_cooldown:${email}`)){
    throw new ClientError({
        message: "Please wait 1 minutes before requesting another OTP.",
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        explanation: ["Invalid data sent from the client"], 
    })
    }
};


export const trackOtpRequests = async(email)=>{
    //console.log("Tracking otp requests");
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || 0)
    
    if(otpRequests >= 2){
        await redis.set(`otp_spam_lock:${email}`, "locked", { ex: 60*60 });
        throw new ClientError({
            message: "Too many attempts, please wait 1 hour before trying again.",
            statusCode: StatusCodes.TOO_MANY_REQUESTS,
            explanation: ["Invalid data sent from the client"],
        })
    }

    await redis.set(otpRequestKey, otpRequests + 1, { ex: 60*60 });
}



export const sendOtp = async(name, email, template)=>{
    //console.log("Sending otp");
    const otp = crypto.randomInt(100000,999999).toString();
    const isSent = await sendEmail(email, "Verify Your Email", template, {name, otp});
    if(!isSent){
        throw new ClientError({
            message: "Failed to send verification email, please try again.",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            explanation: ["Email service failed to deliver the OTP"],
        })
    }
    await redis.set(`otp:${email}`, otp, { ex: 5*60 });
    await redis.set(`otp_cooldown:${email}`, "true", { ex: 60*1 });
}