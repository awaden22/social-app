import type z from "zod";
import {
  confirmEmailSchema,
  loginSchema,
  resendConfirmEmailSchema,
  signupSchema,
} from "./auth.validation.js";

export type SignupDto = z.infer<typeof signupSchema.body>;
export type LoginDto = z.infer<typeof loginSchema.body>;
export type ConfirmEmailDto = z.infer<typeof confirmEmailSchema.body>;
export type ResendConfirmEmailDto = z.infer<
  typeof resendConfirmEmailSchema.body
>;
