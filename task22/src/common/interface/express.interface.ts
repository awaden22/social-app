import type { Socket } from "socket.io";
import type { IHUser } from "../../DB/Models/user.Models.js";
import type { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user: IHUser;
    Payload: JwtPayload;
  }
}

export interface SocketAuthType extends Socket {
  data: {
    user: IHUser;
    verifytoken: JwtPayload;
  };
}