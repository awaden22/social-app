import express from "express";

import authController from "./auth/auth.controller.js";
import globalErrHandler from "./Middlewares/globalErr.middleware.js";
import { SERVER_PORT } from "./config/config.service.js";
import testDBConnection from "./DB/connection.js";
import { testRedisConnection } from "./DB/Models/Redis/redis.coonection.js";
import userController from "./user/user.controller.js";
 async function bootstrap(){
  const port = SERVER_PORT 
   const app:express.Express=express();

   app.use(express.json())
   await testDBConnection();

  await testRedisConnection();

   app.use("/auth",authController);
   app.use("/user",userController)


   app.use(globalErrHandler);
   app.listen(port,()=>{
    console.log(`app listen on port${port} `)

   })
 }

 export default bootstrap;