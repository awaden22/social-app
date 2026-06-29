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

    const decodeToken = tokenService.decodetoken(token) as JwtPayload;

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
      tokenService.getSignature(role);

    const verifytoken = tokenService.verifyToken(
      token,
      tokenTypeParm === TokenEnums.Access ? accessSignature : refreshSignature,
    ) as JwtPayload;

    if (!verifytoken || !verifytoken.iat || !verifytoken.sub) {
      throw new UnauthorizedException("invalid token");
    }

    const isBlacklisted = await RedisMethods.get(
      RedisMethods.blockListTokenId(
        verifytoken.sub as string,
        verifytoken.jti!,
      ),
    );

    if (isBlacklisted) {
      throw new UnauthorizedException(
        "token is blacklisted, you need to login again",
      );
    }

    const user = await DBRepo.findById({
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

    req.user = user;
    req.Payload = verifytoken;

    next();
  };
}
