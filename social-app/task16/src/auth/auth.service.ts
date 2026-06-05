import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../common/exceptions/domain.exception.js";
import { compareOperation, hashOperation } from "../common/security/hash.js";
import { encrptionData } from "../common/security/encryption.js";
import { ENYCRPTION_KEY } from "../config/config.service.js";
import token from "../common/security/token.js";
import DBRepo from "../DB/Repo/db.repo.js";
import UserRepo from "../DB/Repo/user.repo.js";
import type {
  ConfirmEmailDto,
  LoginDto,
  ResendConfirmEmailDto,
  SignupDto,
} from "./auth.dto.js";
import { emailEnums } from "../common/enums/email.enums.js";
import EmailService from "../common/email/email.service.js";
import redisServices from "../DB/Models/Redis/redis.services.js";

class AuthService {
  private _userRepo = UserRepo;
  private _token = token;
  private _emailService = EmailService;
  private _redisMethods = redisServices;

  constructor() {}
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
  }

  async resendConfirmEmailOtp(bodydate: ResendConfirmEmailDto) {
    const { email } = bodydate;
    await this._emailService.sendOtpEmail({
      email,
      emailType: emailEnums.confirmEmail,
      subject: "confirm",
    });
  }

  public async login(bodydata: LoginDto) {
    const { email, password } = bodydata;
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
    return await this._token.generateAceessTokenAndRefreshToken(user);
  }
}

export default new AuthService();
