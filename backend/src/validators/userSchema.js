import {z} from 'zod';

export const userSignUpSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
    password: z.string().min(6).max(20),
});


export const verifyUserSchema = z.object({
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    otp: z.string().min(6).max(6),
    password: z.string().min(6).max(20),
})

export const userSignInSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    password: z.string().min(6).max(20),
});


export const forgotPasswordSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
})

export const verifyOtpSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    otp: z.string().min(6).max(6),
})

export const changePasswordSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    password: z.string().min(6).max(20),
});

export const resetPasswordSchema = z.object({
    oldPassword: z.string().min(6).max(20),
    newPassword: z.string().min(6).max(20),
});

