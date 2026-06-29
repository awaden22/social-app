
import type { Request, Response, NextFunction } from "express";
import { RoleEnum } from "../common/enums/user.enums.js";
import { MapGQLError, UnauthorizedException } from "../common/exceptions/domain.exception.js";

export function authorizationGQL(userRole:RoleEnum,endPointRules:RoleEnum[]){
    if(!endPointRules.includes(userRole)){
      MapGQLError(new UnauthorizedException("you dont have access"))
    }
    

  }
export function authorization(
  roles: RoleEnum[] = [RoleEnum.Admin]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: { role: RoleEnum } }).user;

    if (!user) {
      return next(new UnauthorizedException("Unauthorized"));
    }

    if (!roles.includes(user.role)) {
      return next(new UnauthorizedException("Don't have access"));
    }

    next();
  };
}





