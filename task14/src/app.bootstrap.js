import express from "express";
import authRouter from "./Modules/Auth/auth.controller.js";

import { SERVER_PORT } from "../config/config.service.js";
import { globalErrorResponse } from "./Common/Response/response.js";
import { testDBConnection } from "./DB/connection.js";
import userRouter from "./Modules/user/user.controller.js";
import path from "path";
import cors from "cors";
import { testRedisConnection } from "./DB/redis.connection.js";
import messageRouter from "./Modules/Message/message.controller.js";
import helmet from "helmet";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import geolite from "geoip-lite";
import * as MethodsRedis from "./DB/redis.service.js"

async function bootstrap() {
  const app = express();
  const port = SERVER_PORT;

  await testDBConnection();
  await testRedisConnection();
  app.set("trust proxy",true)

  const corsOptions = {
    origin: "http://localhost:3000",
  };

  app.use(
    cors({
      origin: "*",
    }),
    helmet(),
    rateLimit({
      windowMs: 5 * 60 * 1000,
      limit: (req,res)=>{
        const geoInfo = geolite.lookup(req.ip)
        return geoInfo?.country === "EG" ? 3:1
      },
      message: "too many request",
      statusCode: 400,
      handler: (req, res) => {
        return res.status(401).json({
          message: "too many request",
        });
      },
      requestPropertyName: "rateLimit",
      keyGenerator:(req)=>{
        const ip = ipKeyGenerator(req.ip)
        return `{req.ip}-${req.path}`
      },
      store:{
        incr:async(key,cb)=>{
          const hits =await MethodsRedis.inc(key)
          if(hits === 1){
            await MethodsRedis.expire(key,60)
          }
          cb(null,hits)
        },
        async decrement(key){
         const isKeyExist= await MethodsRedis.exists(key)
         if(isKeyExist){
          await MethodsRedis.decr(key)
         }
        }
      },
      skipSuccessfulRequests:true
    }),
  );
  app.use((req,res)=>{
    console.log(req.headers["x-forwarded-for"]),
    console.log(req.ip)
  })
  app.use(express.json());
  app.use("/uploads", express.static(path.resolve("./uploads")));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);
  app.use(globalErrorResponse);
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
}

export default bootstrap;
