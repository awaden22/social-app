import express from "express";
import {
  allowedFileFormat,
  localUpload,
} from "../../Common/Multer/multer.config.js";
import {
  deleteMessage,
  getAllMessage,
  getMessageById,
  sendMessage,
} from "./message.service.js";
import {
  badRequestException,
  successResponse,
} from "../../Common/Response/response.js";
import { deleteMessageSchema, getMessageSchema, sendMessageSchema } from "./message.validation.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { authentication } from "../../../middleware/authentication.middleware.js";

const messageRouter = express.Router();

messageRouter.post(
  "/:receiverId",
  localUpload({
    folderName: "message",
    allowedformat: [...allowedFileFormat.img, ...allowedFileFormat.videos],
  }).array("attachments", 5),
  // async (req, res, next) => {
  //   const { authorization } = req.headers;
  //   if (authorization) {
  //     const authMiddleware = authentication();
  //     return authMiddleware();
  //     next();
  //   }
  //   next();
  // }
  authentication(),
  validation(sendMessageSchema),
  async (req, res, next) => {
    if (!req.files || !req.body.content) {
      return badRequestException("content and attachments are required");
    }
  next();   
  },
  async (req, res) => {
    await sendMessage(
      req.params.receiverId,
      req.body.content,
      req.files.map((file) => file.finalPath),
      req.user._id, // Pass senderId from authenticated user
    );
    return successResponse({
      res,
      statusCode: 201,
      data: "Message sent successfully",
    });
  },
);

messageRouter.get("/allMessages", authentication(), async (req, res) => {
  const messages = await getAllMessage(req.user);
  return successResponse({
    res,
    statusCode: 200,
    data: messages,
  });
});

messageRouter.get(
  "/:messageId",
  authentication(),
  validation(getMessageSchema),
  async (req, res) => {
    const messages = await getMessageById(req.user, req.params.messageId);
    return successResponse({
      res,
      statusCode: 200,
      data: messages,
    });
  },
);

messageRouter.delete(
  "/:messageId",
  authentication(),
  validation(deleteMessageSchema),
  async(req,res)=>{
    await deleteMessage(req.user,req.params.messageId)
 return successResponse({
      res,
      statusCode: 201,
      data: "Message deleted successfully",
    });
  
  }
);

export default messageRouter;
