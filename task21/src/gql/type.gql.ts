import type { JwtPayload } from "jsonwebtoken";
import type { IHUser } from "../DB/Models/user.Models.js";

export type ContextType ={user:IHUser,payload:JwtPayload}