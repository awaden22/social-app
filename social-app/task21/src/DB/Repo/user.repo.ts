import type { ObjectId } from "mongoose"
import type { IUser } from "../Models/user.Models.js"
import userModel from "../Models/user.Models.js"
import DBRepo from "./db.repo.js"


class UserRepo extends DBRepo<IUser>{
    constructor(){
        super(userModel)
    }
    public async checkUser(id:ObjectId):Promise<boolean>{
        return(await this.findOne({filter:{_id:id}}))!= null

    }
}

export default new UserRepo()