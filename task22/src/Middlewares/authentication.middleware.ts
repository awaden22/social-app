import type { NextFunction, Request, Response } from "express";
import { TokenEnums } from "../common/enums/token.enums.js";
import {
  BadRequestException,
  UnauthorizedException,
} from "../common/exceptions/domain.exception.js";
import tokenService from "../common/security/token.js";
import type { JwtPayload } from "jsonwebtoken";
import type { RoleEnum } from "../common/enums/user.enums.js";
import RedisMethods from "../DB/Models/Redis/redis.services.js";
import DBRepo from "../DB/Repo/user.repo.js";

export function authentication(tokenTypeParm = TokenEnums.Access) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new BadRequestException("authorization header is required");
    }

    const [BearerKey, token] = authorization.split(" ");

    if (BearerKey !== "Bearer") {
      throw new BadRequestException("bearer invalid key");
    }

    if (!token) {
      throw new UnauthorizedException("you need to first login");
    }

   const{user,verifytoken}= await tokenService.checkToken(token)

    req.user = user;
    req.Payload = verifytoken;

    next();
  };
}
