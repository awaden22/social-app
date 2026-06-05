import {
  confirmEmailSchema,
  loginSchema,
  resendConfirmEmailSchema,
  signupSchema,
} from "./auth.validation.js";
import express from "express";
import authService from "./auth.service.js";
import { successResponse } from "../common/response/success.response.js";
import type { SignupDto } from "./auth.dto.js";

import { BadRequestException } from "../common/exceptions/domain.exception.js";
import { validation } from "../Middlewares/validation.middleware.js";
const authController = express.Router();

authController.post("/signup", validation(signupSchema), async (req, res) => {
  const result = await authService.signup(req.body);
  return successResponse<any>({ res, data: result });
});
authController.post(
  "/confirm-email-otp",
  validation(confirmEmailSchema),
  async (req, res) => {
    await authService.confirmEmail(req.body);
    return successResponse<any>({ res, msg: "email confirm successful" });
  },
);
authController.post(
  "/resend-confirm-email-otp",
  validation(resendConfirmEmailSchema),
  async (req, res) => {
    await authService.resendConfirmEmailOtp(req.body);
    return successResponse<any>({ res, msg: "check your inbox" });
  },
);
authController.post("/login", validation(loginSchema), async (req, res) => {
  const result = await authService.login(req.body);
  return successResponse({ res, data: result });
});

export default authController;
