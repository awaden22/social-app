import { RoleEnums } from "../src/Common/Enums/enums.user.js"
import { forbiddenException } from "../src/Common/Response/response.js"

export function authorization (roles=[RoleEnums.User]){
return(req,res,next)=>{
    if(!roles.includes(req.user.role)){
  return forbiddenException("dont have access")
}
next()
}
}
