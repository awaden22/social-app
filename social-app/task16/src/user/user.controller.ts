import express  from 'express';
import { authentication } from '../Middlewares/authentication.middleware.js';
import { successResponse } from '../common/response/success.response.js';

const userController = express.Router();

userController.get("/",authentication(),(req,res)=>{
  return successResponse({res,data:req.user

  })
})


export default userController;
