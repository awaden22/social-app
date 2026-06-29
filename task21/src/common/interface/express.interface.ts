
import type { IHUser } from '../../DB/Models/user.Models.js';
import type { JwtPayload } from 'jsonwebtoken';
declare module "express-serve-static-core"{
    interface Request{
        user:IHUser,
        Payload:JwtPayload
    }
}