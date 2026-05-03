import express from "express";
import * as authSercice from "./auth.service.js";
import { successResponse } from "../../Common/Response/response.js";
import {
  confirmEmailSchema,
  loginSchema,
  resendConfirmEmailOtpSchema,
  resetForgetPasswordSchema,
  sendForgetPasswordOtpSchema,
  signupSchema,
  verifyForgetPasswordOtpSchema,
} from "./auth.validation.js";
import { validation } from "../../../middleware/validation.middleware.js";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validation(signupSchema),

  async (req, res) => {
    const result = await authSercice.signup(req.vbody);
    return successResponse({ res, statusCode: 201, data: result });
  },
);

authRouter.post(
  "/confirmEmail",
  validation(confirmEmailSchema),
  async (req, res) => {
    
    const result = await authSercice.confirmEmail(req.vbody);
    return successResponse({ res, data: result });
  },
);

authRouter.post(
  "/resend-Email-otp",
  validation(resendConfirmEmailOtpSchema),
  async (req, res) => {
    const result = await authSercice.resendConfirmEmailOtp(req.vbody.email);
    return successResponse({ res, data: result });
  },
);
authRouter.post("/send-forget-password-otp",validation(sendForgetPasswordOtpSchema),async(req,res)=>{


  const result = await authSercice.sendOtpForgetPassword(req.vbody.email)
  return successResponse({res,data:result})
})

authRouter.post("/verify-forget-password-otp",validation(verifyForgetPasswordOtpSchema),async(req,res)=>{


  const result = await authSercice.verifyOtpForgetPassword(req.body)
  return successResponse({res,data:result})
})

authRouter.post("/reset-forget-password-otp",validation(resetForgetPasswordSchema),async(req,res)=>{


  const result = await authSercice.resetPassword(req.vbody)
  return successResponse({res,data:result})
})
authRouter.post(
  "/resend-forget-password-otp",
  validation(resendConfirmEmailOtpSchema),
  async (req, res) => {
    const result = await authSercice.resendForgetPasswordOtp(req.vbody.email);
    return successResponse({ res, data: result });
  },
);


authRouter.post("/signup/gmail", async (req, res) => {
  const { status, result } = await authSercice.signupWithGoogle(req.body);
  return successResponse({ res, statusCode: status, data: result });
});

authRouter.post("/login", validation(loginSchema), async (req, res) => {
  const result = await authSercice.login(req.body);
  return successResponse({ res, data: result });
});

authRouter.post(
  "/verify-2fa-otp",
  async (req, res) => {
    const result = await authSercice.verifyTwoFactorOtpService(req.body);
    return successResponse({ res, data: result });
  }
);
export default authRouter;
