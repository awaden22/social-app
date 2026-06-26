import { GraphQLError } from "graphql";
import type { RoleEnum } from "../common/enums/user.enums.js";
import { MapGQLError, UnauthorizedException } from "../common/exceptions/domain.exception.js";

function authorizationGQL(userRole:RoleEnum,endPointRules:RoleEnum[]){
    if(!endPointRules.includes(userRole)){
      MapGQLError(new UnauthorizedException("you dont have access"))
    }
}
export default authorizationGQL