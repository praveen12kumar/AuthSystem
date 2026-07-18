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



// Protects an account from password-guessing: after MAX_SIGNIN_ATTEMPTS
// consecutive wrong passwords, the account is locked out for
// SIGNIN_LOCK_SECONDS regardless of whether a later attempt is correct.
// Keyed by email, same as the OTP rate-limiting above - doesn't stop
// low-volume guessing spread across many different accounts, but that's
// the same scope this file's OTP protections already accept.
const MAX_SIGNIN_ATTEMPTS = 5;
const SIGNIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;
const SIGNIN_LOCK_SECONDS = 15 * 60;

export const checkSigninRestrictions = async(email)=>{
    if(await redis.get(`signin_lock:${email}`)){
        throw new ClientError({
            message: "Too many failed attempts, please wait 15 minutes before trying again.",
            statusCode: StatusCodes.TOO_MANY_REQUESTS,
            explanation: ["Account temporarily locked due to repeated failed signin attempts"],
        })
    }
};

export const trackFailedSignin = async(email)=>{
    const attemptsKey = `signin_attempts:${email}`;
    const attempts = parseInt((await redis.get(attemptsKey)) || 0) + 1;

    if(attempts >= MAX_SIGNIN_ATTEMPTS){
        await redis.set(`signin_lock:${email}`, "locked", { ex: SIGNIN_LOCK_SECONDS });
        await redis.del(attemptsKey);
        return;
    }

    await redis.set(attemptsKey, attempts, { ex: SIGNIN_ATTEMPT_WINDOW_SECONDS });
};

export const clearSigninAttempts = async(email)=>{
    await redis.del(`signin_attempts:${email}`, `signin_lock:${email}`);
};

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