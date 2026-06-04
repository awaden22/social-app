import redisServices from "../../DB/Models/Redis/redis.services.js";
import type { emailEnums } from "../enums/email.enums.js";
import { BadRequestException } from "../exceptions/domain.exception.js";
import { generateOtp } from "../OTP/otp.services.js";
import { hashOperation } from "../security/hash.js";
import sendMail from "./email.config.js";

class EmailService {
  private _redisMethods = redisServices;

  async sendOtpEmail({
    email,
    emailType,
    subject,
  }: {
    email: string;
    emailType: emailEnums;
    subject: string;
  }) {
    const otpTtl = await this._redisMethods.ttl(
      this._redisMethods.getOTPkey(email, emailType),
    );
    if (otpTtl > 0) {
      throw new BadRequestException(
        ` you can request new otp after ${otpTtl} seconds`,
      );
    }
    const isBlocked = await this._redisMethods.exists(
      this._redisMethods.getOTPReqBlockkey(email, emailType),
    );
    if (isBlocked) {
      throw new BadRequestException(
        "you have exceeded the max number of otp requests",
      );
    }

    const otpRequestCount = await this._redisMethods.get(
      this._redisMethods.getOTPReqNOkey(email, emailType),
    );
    if (Number(otpRequestCount) > 5) {
      await this._redisMethods.set(
        this._redisMethods.getOTPReqBlockkey(email, emailType),
        1,
        60 * 10,
      );
      throw new BadRequestException(
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

    await this._redisMethods.set(
      this._redisMethods.getOTPkey(email, emailType),
      otpHash,
      300,
    );

    await this._redisMethods.inc(
      this._redisMethods.getOTPReqNOkey(email, emailType),
    );
  }
}
export default new EmailService();
