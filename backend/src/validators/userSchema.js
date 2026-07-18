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

// multipart/form-data - avatar arrives as req.file, not a body field. All
// fields optional: only what's actually edited gets sent from the client.
export const updateProfileSchema = z.object({
    firstName: z.string().min(2).max(20).optional(),
    lastName: z.string().min(2).max(20).optional(),
    about: z.string().max(500).optional(),
    phoneNumber: z.string().max(20).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dob: z.string().optional(),
});

