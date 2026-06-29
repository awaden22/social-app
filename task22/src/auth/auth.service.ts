import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../common/exceptions/domain.exception.js";
import { compareOperation, hashOperation } from "../common/security/hash.js";
import { encrptionData } from "../common/security/encryption.js";
import { Client_Token_ID, ENYCRPTION_KEY } from "../config/config.service.js";
import token from "../common/security/token.js";
import UserRepo from "../DB/Repo/user.repo.js";
import { OAuth2Client } from "google-auth-library";
import type {
  ConfirmEmailDto,
  ForgetPasswordDto,
  LoginDto,
  ResendConfirmEmailDto,
  ResetPasswordDto,
  SignupDto,
  VerifyOtpForgetPasswordDto,
} from "./auth.dto.js";
import { emailEnums } from "../common/enums/email.enums.js";
import EmailService from "../common/email/email.service.js";
import redisServices from "../DB/Models/Redis/redis.services.js";
import { ProivderEnum } from "../common/enums/user.enums.js";
import type { IHUser } from "../DB/Models/user.Models.js";
import notificationService from "../common/Notification/notification.service.js";

class AuthService {
  private _userRepo = UserRepo;
  private _token = token;
  private _emailService = EmailService;
  private _redisMethods = redisServices;
  private _notification = notificationService;

  constructor() { }
  public async signup(bodydata: SignupDto) {
    const { email } = bodydata;
    const isEmail = await this._userRepo.findOne({
      filter: { email },
    });
    if (isEmail) {
      throw new ConflictException("email already exist");
    }
    bodydata.password = await hashOperation({ plainText: bodydata.password });

    if (bodydata.phone) {
      bodydata.phone = encrptionData({ data: bodydata.phone, ENYCRPTION_KEY });
    }

    const user = await this._userRepo.create({ data: bodydata });
    await this._emailService.sendOtpEmail({
      email,
      emailType: emailEnums.confirmEmail,
      subject: "confirm",
    });

    return user!;
  }

  async confirmEmail(bodydata: ConfirmEmailDto) {
    const { email, otp } = bodydata;
    const user = await this._userRepo.findOne({
      filter: { email },
    });

    if (!user) {
      throw new NotFoundException("email not found");
    }

    if (user.confirmEmail) {
      throw new BadRequestException("email already verified");
    }

    const otpHash = await this._redisMethods.get(
      this._redisMethods.getOTPkey(email, emailEnums.confirmEmail),
    );

    if (!otpHash) {
      throw new BadRequestException("otp expired");
    }

    const isOtpValid = await compareOperation({
      plainValue: otp.toString(),
      hashValue: otpHash,
    });

    if (!isOtpValid) {
      throw new BadRequestException("invalid otp");
    }

    user.confirmEmail = true;

    await user.save();
    await this._redisMethods.del(
      this._redisMethods.getOTPkey(email, emailEnums.confirmEmail)
    );
  }

  async resendConfirmEmailOtp(bodydata: ResendConfirmEmailDto) {
    const { email } = bodydata;
    const user = await this._userRepo.findOne({
      filter: { email },
    });

    if (!user) {
      throw new NotFoundException("Email not found");
    }

    if (user.confirmEmail) {
      throw new BadRequestException("Email already verified");
    }

    await this._emailService.sendOtpEmail({
      email,
      emailType: emailEnums.confirmEmail,
      subject: "confirm",
    });
  }

  async sendOtpForgetPassword(bodydata: ForgetPasswordDto) {


    const { email } = bodydata;
    const user = await this._userRepo.findOne({
      filter: { email },
    });
    if (!user) {
      return;
    }
    if (!user.confirmEmail) {
      throw new BadRequestException(
        "please verify your email before reset password",
      );
    }
    await this._emailService.sendOtpEmail({
      email,
      emailType: emailEnums.forgetPassword,
      subject: "reset password",
    });
  }

  async verifyOtpForgetPassword(bodydata: VerifyOtpForgetPasswordDto) {
    const { email, otp } = bodydata;
    const key = this._redisMethods.getOTPkey(email, emailEnums.forgetPassword);

    const emailOtp = await this._redisMethods.get(key);
    if (!emailOtp) {
      throw new BadRequestException("otp expired");
    }
    const isOtp = await compareOperation({
      plainValue: otp.toString(),
      hashValue: emailOtp,
    });
    if (!isOtp) {
      throw new BadRequestException("invalid otp");
    }
  }

  async resetPassword(bodydata: ResetPasswordDto) {
    const { email, otp, newPassword } = bodydata;
    await this.verifyOtpForgetPassword({ email, otp });
    await this._userRepo.updateOne({
      filter: { email },
      update: {
        password: await hashOperation({ plainText: newPassword }),
        changeCreditTime: Date.now(),

      },
    });
    await this._redisMethods.del(
      this._redisMethods.getOTPkey(email, emailEnums.forgetPassword)
    )
  }

  async resendForgetPasswordOtp(bodydata: ResendConfirmEmailDto) {
    const { email } = bodydata;
    const user = await this._userRepo.findOne({
      filter: { email },
    });

    if (!user) {
      throw new NotFoundException("Email not found");
    }

    if (!user.confirmEmail) {
      throw new BadRequestException("first confirm email");
    }
    await this._emailService.sendOtpEmail({
      email,
      emailType: emailEnums.forgetPassword,
      subject: "reset password",
    });
  }

  async login(bodydata: LoginDto) {
    const { email, password, FCM } = bodydata;
    const user = await this._userRepo.findOne({
      filter: { email },
    });

    if (!user) {
      throw new BadRequestException("invalid email or password");
    }

    if (!user.confirmEmail) {
      throw new BadRequestException("Please verify your email before login");
    }

    const isPassword = await compareOperation({
      plainValue: password,
      hashValue: user.password,
    });
    if (!isPassword) {
      throw new BadRequestException("password is not valid");
    }
    await this._redisMethods.addActiveUser(user._id);
    if (FCM) {
      await this._redisMethods.addFcmTokenToset(user._id, FCM);
      const tokens = await this._redisMethods.getMemberFcmToken(user._id);
      await this._notification.sendNotifications({
        tokens,
        data: { title: "user log in", body: "user logged" },
      });
    }
   return {
    status: 200,
    result: await this._token.generateAceessTokenAndRefreshToken(user),
  };
  }

  async verifyGoogleToken(idToken: string) {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: Client_Token_ID,
    });
    const payload = ticket.getPayload();

   
    return payload;
  }

  async loginWithGoogle(idToken: string): Promise<{
    status: number;
    result: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    const payloadGoogleToken = await this.verifyGoogleToken(idToken);

    if (!payloadGoogleToken) {
      throw new BadRequestException("invalid token");
    }

    if (!payloadGoogleToken.email_verified) {
      throw new BadRequestException("Email must be verified");
    }

    const user = await this._userRepo.findOne({
      filter: {
        email: payloadGoogleToken.email as string,
      
      },
    });

    if (!user) {
      return this.signupWithGoogle(idToken);
    }
    if (user.Provider === ProivderEnum.System) {
  throw new BadRequestException(
    "This email is registered with email/password")
  }
  
   await this._redisMethods.addActiveUser(user._id); 
   
    return {
      status: 200,
      result: await this._token.generateAceessTokenAndRefreshToken(user),
    };
  }

  async signupWithGoogle(idToken: string): Promise<{
    status: number;
    result: {
      accessToken: string;
      refreshToken: string;
    };
  }> {
    const payloadGoogleToken = await this.verifyGoogleToken(idToken);

    if (!payloadGoogleToken) {
      throw new BadRequestException("invalid token");
    }

    if (!payloadGoogleToken.email_verified) {
      throw new BadRequestException("Email must be verified");
    }

    const user = await this._userRepo.findOne({
      filter: {
        email: payloadGoogleToken.email as string,
 
      },
    });

    if (user) {
      if (user.Provider === ProivderEnum.System) {
        throw new BadRequestException("This email is registered with email/password");
      }

      return this.loginWithGoogle(idToken);
    }


    const createdUser = await this._userRepo.create({
      data: {
        userName: payloadGoogleToken.name,
        email: payloadGoogleToken.email,
        Provider: ProivderEnum.Google,
        confirmEmail: true,
        profilePic: payloadGoogleToken.picture,
      },
    });

    // دعم حالتين حسب الـ repo implementation
    const newUser = Array.isArray(createdUser) ? createdUser[0] : createdUser;

    if (!newUser) {
      throw new BadRequestException("User creation failed");
    }

    await this._redisMethods.addActiveUser(newUser._id);

   return {
  status: 201,
  result: await this._token.generateAceessTokenAndRefreshToken(newUser as IHUser),
};
  }
}

export default new AuthService();
