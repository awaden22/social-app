import {
  badRequestException,
  conflictException,
  notFoundException,
  successResponse,
} from "../../Common/Response/response.js";
import UserModel from "../../DB/Models/User.model.js";

import * as DBRepo from "../../DB/db.respository.js";
import CryptoJS from "crypto-js";

import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import {
  Client_Token_ID,
  ENYCRPTION_KEY,
} from "../../../config/config.service.js";
import { OAuth2Client } from "google-auth-library";
import * as RedisMethods from "../../DB/redis.service.js";
import { generateAceessTokenAndRefreshToken, getSignature } from "../../Common/Security/token.js";
import { Provider } from "../../Common/Enums/enums.user.js";
import { generateOtp } from "../../Common/OTP/otp.service.js";
import sendMail from "../../Common/email/email.config.js";
import { emailEnums } from "../../Common/Enums/enums.email.js";
import { TokenEnums } from "../../Common/Enums/token.enums.js";

export async function sendOtpEmail({ email, emailType, subject }) {
  const otpTtl = await RedisMethods.ttl(
    await RedisMethods.getOTPkey(email, emailType),
  );
  if (otpTtl > 0) {
    return badRequestException(
      ` you can request new otp after ${otpTtl} seconds`,
    );
  }
  const isBlocked = await RedisMethods.exist(
    await RedisMethods.getOTPReqBlockkey(email, emailType),
  );
  if (isBlocked) {
    return badRequestException(
      "you have exceeded the max number of otp requests",
    );
  }

  const otpRequestCount = await RedisMethods.get(
    await RedisMethods.getOTPReqNOkey(email, emailType),
  );
  if (otpRequestCount > 5) {
    await RedisMethods.set(
      await RedisMethods.getOTPReqBlockkey(email, emailType),
      1,
      60 * 10,
    );
    return badRequestException(
      "You have exceeded the max number of otp requests",
    );
  }
  const otp = generateOtp();
  await sendMail({
    to: email,
    subject,
    text: `your otp is ${otp}`,
    html: `<p>your otp is <b>${otp}</b></p>`,
  });
  const otpHash = await hashOperation({ plainText: otp.toString() });

  await RedisMethods.set(
    await RedisMethods.getOTPkey(email, emailType),
    otpHash,
    300,
  );

  await RedisMethods.inc(await RedisMethods.getOTPReqNOkey(email, emailType));
}

// signup with email and password

export async function signup(bodydata) {
  const { email, password } = bodydata;
  const isEmail = await DBRepo.findOne(UserModel, { email });
  if (isEmail) {
    return conflictException("Email already exist");
  }
  bodydata.password = await hashOperation({ plainText: password });

  const result = await DBRepo.create(UserModel, bodydata);

  await sendOtpEmail({
    email,
    emailType: emailEnums.confirmEmail,
    subject: "confirm",
  });
  await RedisMethods.set(
    await RedisMethods.confirmEmailKey(email),
    "pending",
    60 * 60 * 24,
  );
  return result;
}

export async function confirmEmail(bodydata) {
  const { email, otp } = bodydata;
  const user = await DBRepo.findOne(UserModel, {
    email,
  });

  if (!user) {
    return notFoundException("email not found");
  }

  if (user.confirmEmail) {
    return badRequestException("email already verified");
  }

  //
  const expireConfirmEmail = await RedisMethods.get(
    RedisMethods.confirmEmailKey(email),
  );

  if (!expireConfirmEmail) {
    await DBRepo.deleteOne(UserModel, { email });
    return badRequestException("verification expired, please signup again");
  }

  const isBlocked = await RedisMethods.exist(
    RedisMethods.getOTPReqBlockkey(email, emailEnums.confirmEmail),
  );

  if (isBlocked) {
    return badRequestException(
      "you have exceeded the max number of otp requests, please try again later",
    );
  }

  const otpHash = await RedisMethods.get(
    RedisMethods.getOTPkey(email, emailEnums.confirmEmail),
  );

  if (!otpHash) {
    return badRequestException("otp expired");
  }

  const isOtpValid = await compareOperation({
    plainValue: otp.toString(),
    hashValue: otpHash,
  });

  if (!isOtpValid) {
    return badRequestException("invalid otp");
  }

  user.confirmEmail = true;

  // 7. cleanup redis
  await RedisMethods.del(RedisMethods.confirmEmailKey(email));
  await RedisMethods.del(
    RedisMethods.getOTPkey(email, emailEnums.confirmEmail),
  );

  // 8. save user
  await user.save();
}

export async function resendConfirmEmailOtp(email) {
  await sendOtpEmail({
    email: email,
    emailType: emailEnums.confirmEmail,
    subject: "confirm",
  });
}

export async function sendOtpForgetPassword(email) {
  const user = await DBRepo.findOne(UserModel, { email });
  if (!user) {
    return;
  }
  if (!user.confirmEmail) {
    return badRequestException(
      "please verify your email before reset password",
    );
  }
  await sendOtpEmail({
    email,
    emailType: emailEnums.forgetPassword,
    subject: "reset password",
  });
}
export async function forgotPasswordLink(email) {
  const user = await DBRepo.findOne(UserModel, { email });

  if (!user) {
    return badRequestException("user not found");
  }

  const { accessSignature } = getSignature(user.role);

  const token = generateSignature(
    {
      id: user._id,
      type: "reset-password",
    },
    accessSignature,
    {
      expiresIn: "15m",
    }
  );

  const link = `http://localhost:3000/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: "Reset Password",
    html: `<a href="${link}">Reset Password</a>`,
  });

  return {
    success: true,
    message: "Reset link sent",
  };
}


export async function verifyOtpForgetPassword(bodydata) {
  const { email, otp } = bodydata;
  const emailOtp = await RedisMethods.get(
    await RedisMethods.getOTPkey(email, emailEnums.forgetPassword),
  );
  if (!emailOtp) {
    return badRequestException("otp expired");
  }
  const isOtp = await compareOperation({
    plainValue: otp.toString(),
    hashValue: emailOtp,
  });
  if (!isOtp) {
    return badRequestException("invalid otp");
  }
}

export async function resetPassword(bodydata) {
  const { email, otp, newpassword } = bodydata;
  await verifyOtpForgetPassword({ email, otp });
  await DBRepo.updateOne({
    model: UserModel,
    filter: { email },
    data: { password: await hashOperation({ plainText: newpassword }) },
  });
}

export async function resendForgetPasswordOtp(email) {
  await sendOtpEmail({
    email: email,
    emailType: emailEnums.forgetPassword,
    subject: "reset password",
  });
}

//login with email and password

export async function login(bodydata) {
  return await banFailedpasswordLogin(bodydata);
}

async function sendTwoFactorOtpService({ email }) {
  const otp = await generateOtp();

  await sendMail({
    to: email,
    subject: "Two Factor Authentication",
    text: `your otp is ${otp}`,
  });

  const otpHash = await hashOperation({ plainText: otp.toString() });

  const otpKey = await RedisMethods.get2FALoginKey(
    email,
    emailEnums.twoFactorAuth,
  );

  await RedisMethods.set(otpKey, otpHash, 600);

  await RedisMethods.set(`2FA_PENDING:${email}`, "1", 600);

  return true;
}

export async function verifyTwoFactorOtpService({ email, otp }) {
  const otpKey = await RedisMethods.get2FALoginKey(
    email,
    emailEnums.twoFactorAuth,
  );

  const pendingKey = `2FA_PENDING:${email}`;
  const attemptsKey = `2FA_ATTEMPTS:${email}`;

  // ✅ check pending
  const isPending = await RedisMethods.get(pendingKey);
  if (!isPending) {
    return badRequestException("No pending 2FA request");
  }

  const otpHash = await RedisMethods.get(otpKey);

  if (!otpHash) {
    return badRequestException("OTP expired");
  }

  // ❌ count attempts
  const attempts = Number(await RedisMethods.inc(attemptsKey));

  if (attempts === 1) {
    await RedisMethods.expire(attemptsKey, 600);
  }

  if (attempts >= 5) {
    await RedisMethods.del(pendingKey);
    await RedisMethods.del(otpKey);
    return badRequestException("Too many wrong OTP attempts");
  }

  const isValid = await compareOperation({
    plainValue: otp.toString(),
    hashValue: otpHash,
  });

  if (!isValid) {
    return badRequestException("Invalid OTP");
  }

  // ✅ success → cleanup
  await RedisMethods.del(otpKey);
  await RedisMethods.del(pendingKey);
  await RedisMethods.del(attemptsKey);

  const user = await DBRepo.findOne(UserModel, { email });

  if (!user) {
    return notFoundException("user not found");
  }

  return generateAceessTokenAndRefreshToken(user);
}

export async function banFailedpasswordLogin(bodydata) {
  const { email, password } = bodydata;

  const blockKey = await RedisMethods.getOTPReqBlockkey(
    email,
    TokenEnums.failedLogins,
  );

  const countKey = await RedisMethods.getOTPReqNOkey(
    email,
    TokenEnums.failedLogins,
  );

  const isBlocked = await RedisMethods.exist(blockKey);

  if (isBlocked) {
    return badRequestException("You are temporarily banned. Try again later.");
  }

  const user = await DBRepo.findOne(UserModel, { email });

  if (!user) {
    return badRequestException("invalid email or password");
  }

  if (!user.confirmEmail) {
    return badRequestException("Please verify your email before login");
  }

  const isPassword = await compareOperation({
    plainValue: password,
    hashValue: user.password,
  });

  if (isPassword) {
    // ✅ reset counters
    await RedisMethods.del(blockKey);
    await RedisMethods.del(countKey);

    if (user.is2FAEnabled) {
      await sendTwoFactorOtpService({ email: user.email });
      return { message: "2FA otp sent to email" };
    }

    return generateAceessTokenAndRefreshToken(user);
  }

  // ❌ failed login
  const attempts = Number(await RedisMethods.inc(countKey));

  if (attempts === 1) {
    await RedisMethods.expire(countKey, 60 * 10);
  }

  if (attempts >= 5) {
    await RedisMethods.set(blockKey, "1", 60 * 5);
    await RedisMethods.del(countKey);

    return badRequestException(
      "Too many failed login attempts. You are banned for 5 minutes.",
    );
  }

  return badRequestException("invalid email or password");
}

// login and signup with google

async function verifyGoogleToken(idToken) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: Client_Token_ID,
  });
  const payload = ticket.getPayload();

  console.log(payload);
  return payload;
}

export async function loginWithGoogle(bodydata) {
  const { idToken } = bodydata;
  const payloadGoogleToken = await verifyGoogleToken(idToken);
  const user = await DBRepo.findOne(UserModel, {
    email: payloadGoogleToken.email,
    provider: Provider.Google,
  });
  if (!user) {
    return signupWithGoogle({ idToken });
  }

  return {
    status: 200,
    result: await generateAceessTokenAndRefreshToken(user),
  };
}

export async function signupWithGoogle(bodyData) {
  const { idToken } = bodyData;
  const payloadGoogleToken = await verifyGoogleToken(idToken);
  if (!payloadGoogleToken.email_verified) {
    return badRequestException("Email must be verified");
  }
  const user = await DBRepo.findOne(UserModel, {
    email: payloadGoogleToken.email,
  });
  if (user) {
    if (user.provider === Provider.System) {
      return badRequestException("account already exist");
    }
    return { status: 200, result: await loginWithGoogle({ idToken }) };
  }
  const newUser = await DBRepo.create(UserModel, {
    userName: payloadGoogleToken.name,
    email: payloadGoogleToken.email,
    provider: Provider.Google,
    confirmEmail: true,
    profilePic: payloadGoogleToken.picture,
  });

  return {
    status: 201,
    result: await generateAceessTokenAndRefreshToken(newUser),
  };
}
