import z, { email } from "zod";
import { GenderEnum } from "../common/enums/user.enums.js";
import { commonValidationFields } from "../Middlewares/validation.middleware.js";

export const loginSchema = {
  body: z.object({
    password: commonValidationFields.password,
    email: commonValidationFields.email,
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
export const resendConfirmEmailSchema={
  body:z.object({
    email:commonValidationFields.email,
 
  })
} 
export const confirmEmailSchema={
  body: resendConfirmEmailSchema.body.extend({
   
    otp:commonValidationFields.otp
  })
}
