
import express from "express";

import authController from "./auth/auth.controller.js";
import globalErrHandler from "./Middlewares/globalErr.middleware.js";
import { SERVER_PORT } from "./config/config.service.js";
import testDBConnection from "./DB/connection.js";
import { testRedisConnection } from "./DB/Models/Redis/redis.coonection.js";
import userController from "./user/user.controller.js";
import cors from "cors";
import s3BuketService from "./common/S3Buket/s3.buket.service.js";
import { promisify } from "node:util";
import { pipeline } from "node:stream";

import postController from "./post/post.controller.js";
import commentController from "./commment/comment.controller.js";
import { createHandler } from "graphql-http/lib/use/express";
import schema from "./gql/schema.gql.js";
import { authentication } from "./Middlewares/authentication.middleware.js";
import realtimeGateway from "./realtime/realtime.gateway.js";
import chatController from "./chat/chat.controller.js";
async function bootstrap() {
  const port = SERVER_PORT;
  const app: express.Express = express();

  app.use(express.json());
  app.use(cors());
  await testDBConnection();

  await testRedisConnection();

  app.use("/auth", authController);
  app.use("/user", userController);
  app.use("/post", postController);
  app.use("/comment", commentController)
  app.use("/chat",chatController)
  app.all("/graphql", 
    authentication(),
    createHandler({ schema:schema,context:(req)=>({user:req.raw.user,token:req.raw.Payload})}))
  app.get("/uploads/*path", async (req, res) => {
    const { path } = req.params;
    const { fileName, download } = req.query;
    const key = req.params.path.join("/");
    const result = await s3BuketService.getFile(key);
    const pipePromise = promisify(pipeline);
    if (download == "true") {
      res.setHeader(
        "content-disposition",
        `attachment;fileName=${fileName || path[path.length - 1]}`,
      );
    }
    await pipePromise(result.Body as NodeJS.ReadableStream, res);
    // res.json(result);
  });
  app.get("/pre-signed-upload/*path", async (req, res) => {
    const { path } = req.params
    const { filename, download } = req.query
    const key = path.join("/");
    const result = await s3BuketService.createPreSigngetFile({
      key,
      filename: filename as string || (path[path.length - 1]) as string,
      download: download as string
    });


  return res.json(result);
  });



  app.use(globalErrHandler);
  const server =app.listen(port, () => {
    console.log(`app listen on port${port} `);
  });
  realtimeGateway.initializeIo(server)
}

export default bootstrap;
