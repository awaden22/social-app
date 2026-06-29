import type { JwtPayload } from "jsonwebtoken";
import type { IHUser } from "../../DB/Models/user.Models.js";
import userRepo from "../../DB/Repo/user.repo.js"
import { authentication } from "../../Middlewares/authentication.middleware.js";
import type { ContextType } from "../../gql/type.gql.js";
import authorizationGQL from "../../Middlewares/authorization.middleware.js";
import { RoleEnum } from "../../common/enums/user.enums.js";
import { UnauthorizedException } from "../../common/exceptions/domain.exception.js";
import { UploadProfileSchema } from "./user.gql.validation.js";
import { validationGQL } from "../../Middlewares/validation.middleware.js";

class UserResolver {
    private _userRepo = userRepo
    userProfile = async (parent: any, args: { userId: string }, context: ContextType) => {

        // console.log({token:context.req.raw.Payload});
        //  console.log({user:context.req.raw.user});
        console.log({ args, context })
        // await authentication(context.req.headers)
        authorizationGQL(context.user.role, [RoleEnum.User])
        validationGQL<{ userId: string }>(UploadProfileSchema, args)

        return context.user
    };

}
export default new UserResolver