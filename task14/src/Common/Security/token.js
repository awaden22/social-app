import {
  TOKEN_SIGNATURE_Admin_Access,
  TOKEN_SIGNATURE_Admin_Refresh,
  TOKEN_SIGNATURE_User_Access,
  TOKEN_SIGNATURE_User_Refresh,
} from "../../../config/config.service.js";
import { RoleEnums } from "../Enums/enums.user.js";
import jwt from "jsonwebtoken";
import { TokenEnums } from "../Enums/token.enums.js";
import {randomUUID} from "crypto";

export function getSignature(role = RoleEnums.User) {
  let accessSignature = "";
  let refreshSignature = "";
  switch (role) {
    case RoleEnums.User:
      accessSignature = TOKEN_SIGNATURE_User_Access;
      refreshSignature = TOKEN_SIGNATURE_User_Refresh;

      break;

    case RoleEnums.Admin:
      accessSignature = TOKEN_SIGNATURE_Admin_Access;
      refreshSignature = TOKEN_SIGNATURE_Admin_Refresh;
      break;
  }
  return { accessSignature, refreshSignature };
}
export function generateSignature(payload, signature, option) {
  return jwt.sign(payload , signature , option );
}
export function decodetoken(token) {
  return jwt.decode(token);
}
export function verifyToken(token, signature) {
  return jwt.verify(token, signature);
}
export async function generateAceessTokenAndRefreshToken(user){
  const tokenId= randomUUID();
   const { accessSignature, refreshSignature } = getSignature(user.role);
    const accessToken = generateSignature({ sub: user._id }, accessSignature, {
      audience: [user.role, TokenEnums.Access],
      expiresIn: 60 * 20,
      jwtid:tokenId
    });
    const refreshToken = generateSignature({ sub: user._id }, refreshSignature, {
      audience: [user.role, TokenEnums.Refresh],
      expiresIn: "1y",
      jwtid:tokenId
    });
    return{accessToken,refreshToken}
}