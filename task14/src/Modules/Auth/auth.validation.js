import joi from "joi";
import { commonFieldValidation } from "../../../middleware/validation.middleware.js";

export const signupSchema = {
  query: joi.object({}).keys({
    ln: joi.string().valid("ar", "en", "fr").required(),
  }),
  body: joi
    .object({})
    .keys({
      userName: commonFieldValidation.userName.required(),
      email: commonFieldValidation.email.required(),
      password: commonFieldValidation.password.required(),
      confirmPassword: joi.string().valid(joi.ref("password")).required(),
      phone: commonFieldValidation.phone,
      DOB: commonFieldValidation.DOB,
      gender: commonFieldValidation.gender,
    })
    .required(),
};
export const loginSchema = {
  body: joi
    .object({
      email: commonFieldValidation.email.required(),
      password: commonFieldValidation.password.required(),
    })
    .xor("email", "userName")
    .messages({
      "object.missing": "you must enter one of them only 'userName' or 'email'",
    }),
};
export const confirmEmailSchema = {
  body: joi.object().keys({
    email: commonFieldValidation.email.required(),
    otp: commonFieldValidation.otp.required(),
  }),
};
export const resendConfirmEmailOtpSchema = {
  body:joi.object().keys({
    email:commonFieldValidation.email.required()
  })
}
export const sendForgetPasswordOtpSchema={
  body:joi.object().keys({
    email :commonFieldValidation.email.required()
  })
}
export const verifyForgetPasswordOtpSchema={
  body:joi.object().keys({
    email :commonFieldValidation.email.required(),
    otp:commonFieldValidation.otp.required()
  })
}
export const resetForgetPasswordSchema={
  body:joi.object().keys({
    email :commonFieldValidation.email.required(),
    otp:commonFieldValidation.otp.required(),
    newpassword:commonFieldValidation.password.required(),
    confirmNewPassword:joi.string().valid(joi.ref("newpassword")).required()
  })
}

