import { randomUUID } from "crypto";
import {
  TOKEN_SIGNATURE_Admin_Access,
  TOKEN_SIGNATURE_Admin_Refresh,
  TOKEN_SIGNATURE_User_Access,
  TOKEN_SIGNATURE_User_Refresh,
} from "../../config/config.service.js";

import jwt, { type SignOptions } from "jsonwebtoken";
import type { IHUser } from "../../DB/Models/user.Models.js";
import { RoleEnum } from "../enums/user.enums.js";
import { TokenEnums } from "../enums/token.enums.js";



class TokenService {
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
}

export default new TokenService()