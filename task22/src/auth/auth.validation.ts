import z from "zod";
import { GenderEnum } from "../common/enums/user.enums.js";
import { commonValidationFields } from "../Middlewares/validation.middleware.js";

export const loginSchema = {
  body: z.object({
    password: commonValidationFields.password,
    email: commonValidationFields.email,
    FCM:z.string().optional()
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      userName: commonValidationFields.userName,
      
      confirmPassword: z.string(),
      age: commonValidationFields.age.optional(),
      gender: commonValidationFields.gender.optional(),
      phone: commonValidationFields.phone.optional(),
    })
    .refine(
      (val) => {
        return val.password === val.confirmPassword;
      },
      {
        message: "confirmPassword does not matched password",
        path: ["confirmPassword"],
      },
    ),
};
export const resendConfirmEmailSchema = {
  body: z.object({
    email: commonValidationFields.email,
  }),
};
export const confirmEmailSchema = {
  body: resendConfirmEmailSchema.body.extend({
    otp: commonValidationFields.otp,
  }),
};
export const forgetPasswordSchema = {
  body: z.object({
    email: commonValidationFields.email,
  }),
};
export const resendForgetPasswordSchema = {
  body: z.object({
    email: commonValidationFields.email,
  }),
};

export const verifyOtpForgetPasswordSchema = {
  body: z.object({
    email: commonValidationFields.email,
    otp: commonValidationFields.otp,
  }),
};
export const resetPasswordSchema = {
  body: verifyOtpForgetPasswordSchema.body.extend({
    newPassword: commonValidationFields.password,
  }),
};

export const SignupGoogleSchema = {
  body: z.object({
    idToken: z.string(),
  }),
};
