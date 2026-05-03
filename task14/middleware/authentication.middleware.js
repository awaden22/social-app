import { RoleEnums } from "../src/Common/Enums/enums.user.js";
import { TokenEnums } from "../src/Common/Enums/token.enums.js";
import {
  badRequestException,
  unauthorizedException,
} from "../src/Common/Response/response.js";
import {
  decodetoken,
  getSignature,
  verifyToken,
} from "../src/Common/Security/token.js";

import UserModel from "../src/DB/Models/User.model.js";
import * as DBRepo from "../src/DB/db.respository.js";
import * as RedisMethods from"../src/DB/redis.service.js"

export function authentication(tokenTypeParm = TokenEnums.Access) {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return badRequestException("authorization header is required");
    }
    const [BearerKey, token] = authorization.split(" ");
    if (BearerKey != "Bearer") {
      return badRequestException("bearer invalid key");
    }

    const decodeToken = decodetoken(token);

    if (!decodeToken || !decodeToken.aud) {
      return badRequestException("invalid token");
    }
    const [userRole, tokenType] = decodeToken.aud;
    const { accessSignature, refreshSignature } = getSignature(userRole);

    if (tokenType != tokenTypeParm) {
      return badRequestException("invalid token Type");
    }

    const verifytoken = verifyToken(
      token,
      tokenTypeParm == TokenEnums.Access ? accessSignature : refreshSignature,
    );
    if (
      
        await RedisMethods.get(RedisMethods.blockListTokenId(verifytoken.sub, verifytoken.jti))
      
    ) {
      return unauthorizedException(
        "token is blacklisted, you need to login again ",
      );
    }
    const user = await DBRepo.findById(UserModel, verifytoken.sub);
    if (!user) {
      return unauthorizedException("account not found");
    }
    if (
      user.changeCreditTime &&
      verifytoken.iat * 1000 < user.changeCreditTime
    ) {
      return unauthorizedException(" you need to login again ");
    }

    req.user = user;
    req.payload = verifytoken;
    next();
  };
}
