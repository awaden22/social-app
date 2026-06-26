import type z from "zod";
import {
  confirmEmailSchema,
  forgetPasswordSchema,
  loginSchema,
  resendConfirmEmailSchema,
  resendForgetPasswordSchema,
  resetPasswordSchema,
  signupSchema,
  verifyOtpForgetPasswordSchema,
} from "./auth.validation.js";

export type SignupDto = z.infer<typeof signupSchema.body>;
export type LoginDto = z.infer<typeof loginSchema.body>;
export type ConfirmEmailDto = z.infer<typeof confirmEmailSchema.body>;
export type ResendConfirmEmailDto = z.infer<
  typeof resendConfirmEmailSchema.body
>;
export type ResetPasswordDto = z.infer<
  typeof resetPasswordSchema.body
>;
export type VerifyOtpForgetPasswordDto = z.infer<
  typeof verifyOtpForgetPasswordSchema.body
>;
export type ResendForgetPasswordDto = z.infer<
  typeof resendForgetPasswordSchema.body
>;
export type ForgetPasswordDto = z.infer<
  typeof forgetPasswordSchema.body
>;

