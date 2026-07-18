import express from 'express';

import { changePassword,forgotPassword, getAllUsers, getMyProfile, resetPassword, signin, signup, updateProfile, updateUserRole, verifyEmail, verifyOtp } from '../../controller/userController.js';
import { authorize, isAuthenticated } from '../../middlewares/authMiddleware.js';
import { uploadSingle } from '../../middlewares/uploadMiddleware.js';
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, updateUserRoleSchema, userSignInSchema,userSignUpSchema, verifyOtpSchema, verifyUserSchema } from '../../validators/userSchema.js';
import { validate } from '../../validators/zodValidators.js';


const router = express.Router();

router.post('/signup', validate(userSignUpSchema), signup);

router.post('/verify-email', validate(verifyUserSchema), verifyEmail);

router.post('/signin', validate(userSignInSchema), signin);

router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp );

router.post('/change-password', validate(changePasswordSchema), changePassword);

router.post('/reset-password', isAuthenticated, validate(resetPasswordSchema), resetPassword);

router.get('/me', isAuthenticated, getMyProfile);

router.put(
  '/me',
  isAuthenticated,
  uploadSingle('avatar'),
  validate(updateProfileSchema),
  updateProfile
);

router.get('/', isAuthenticated, authorize('ADMIN'), getAllUsers);

router.put(
  '/:id/role',
  isAuthenticated,
  authorize('ADMIN'),
  validate(updateUserRoleSchema),
  updateUserRole
);




export default router;
