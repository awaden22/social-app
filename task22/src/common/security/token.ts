import { randomUUID } from "crypto";
import {
  TOKEN_SIGNATURE_Admin_Access,
  TOKEN_SIGNATURE_Admin_Refresh,
  TOKEN_SIGNATURE_User_Access,
  TOKEN_SIGNATURE_User_Refresh,
} from "../../config/config.service.js";

import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { IHUser } from "../../DB/Models/user.Models.js";
import { RoleEnum } from "../enums/user.enums.js";
import { TokenEnums } from "../enums/token.enums.js";
import { BadRequestException, UnauthorizedException } from "../exceptions/domain.exception.js";
import redisServices from "../../DB/Models/Redis/redis.services.js";
import userRepo from "../../DB/Repo/user.repo.js";



class TokenService {
  private _redisService= redisServices
  private _userRepo =userRepo
  constructor() {}
    getSignature(role = RoleEnum.User) {
  let accessSignature = "";
  let refreshSignature = "";
  switch (role) {
    case RoleEnum.User:
      accessSignature = TOKEN_SIGNATURE_User_Access;
      refreshSignature = TOKEN_SIGNATURE_User_Refresh;

      break;

    case RoleEnum.Admin:
      accessSignature = TOKEN_SIGNATURE_Admin_Access;
      refreshSignature = TOKEN_SIGNATURE_Admin_Refresh;
      break;
  }
  return { accessSignature, refreshSignature };
}
  generateSignature({
  payload,
  signature,
  options,
}: {
  payload: string | object;
  signature: string;
  options?: SignOptions;
}) {
  return jwt.sign(payload, signature, options);
}
  decodetoken(token: string) {
  return jwt.decode(token);
}
  verifyToken(token: string, signature: string) {
  return jwt.verify(token, signature);
}
 async  generateAceessTokenAndRefreshToken(user: IHUser) {
  const tokenId = randomUUID();
  const { accessSignature, refreshSignature } = this.getSignature(user.role);
  const accessToken = this.generateSignature({
    payload:{},
    
    signature: accessSignature,
    options: {
      
      audience: [String(user.role), String(TokenEnums.Access)],
      expiresIn: 60 * 20,
      jwtid: tokenId,
       subject : user._id.toString()
       
    },
  });
  const refreshToken = this.generateSignature({
  payload:{},
    signature: refreshSignature,
     options: {
      
      audience: [String(user.role), String(TokenEnums.Refresh)],
      expiresIn: 60 * 20,
      jwtid: tokenId,
       subject: user._id.toString()
    },
  });
  return { accessToken, refreshToken };
}
async checkToken(token:string,tokenTypeParm=TokenEnums.Access){
   const decodeToken =this.decodetoken(token) as JwtPayload;

    if (!decodeToken || !decodeToken.aud) {
      throw new BadRequestException("invalid token");
    }

    if (!Array.isArray(decodeToken.aud)) {
      throw new BadRequestException("invalid token audience");
    }

    const [userRole, tokenType] = decodeToken.aud;

    if (tokenType !== String(tokenTypeParm)) {
      throw new BadRequestException("invalid token Type");
    }

    const role = Number(userRole) as RoleEnum;

    const { accessSignature, refreshSignature } =
      this.getSignature(role);

    const verifytoken = this.verifyToken(
      token,
      tokenTypeParm === TokenEnums.Access ? accessSignature : refreshSignature,
    ) as JwtPayload;

    if (!verifytoken || !verifytoken.iat || !verifytoken.sub) {
      throw new UnauthorizedException("invalid token");
    }

    const isBlacklisted = await this._redisService.get(
      this._redisService.blockListTokenId(
        verifytoken.sub as string,
        verifytoken.jti!,
      ),
    );

    if (isBlacklisted) {
      throw new UnauthorizedException(
        "token is blacklisted, you need to login again",
      );
    }

    const user = await this._userRepo.findById({
      id: verifytoken.sub as string,
    });

    if (!user) {
      throw new UnauthorizedException("account not found");
    }

    if (
      user.changeCreditTime &&
      verifytoken.iat * 1000 < user.changeCreditTime.getTime()
    ) {
      throw new UnauthorizedException("you need to login again");
    }
    return {
      user,verifytoken
    }
}
}

export default new TokenService()