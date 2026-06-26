import express from "express";
import userController from '../user/user.controller.js';
import chatService from "./chat.service.js";
import { successResponse } from "../common/response/success.response.js";
import { authentication } from "../Middlewares/authentication.middleware.js";
import cloudFileUpload from "../multer/multer.config.js";


const chatController = express.Router({ mergeParams: true });

chatController.get("/",
    authentication(), async (req, res) => {
        console.log("originalUrl =", req.originalUrl);
        console.log("params", req.params);
        const result = await chatService.getChat(req.params.userId as string, req.user)
        console.log(result);
        return successResponse({ res, data: result })
    })
chatController.post("/create-group",
    authentication(),
    cloudFileUpload({}).single("attachment"),
    async (req, res) => {

        const result = await chatService.createGroup(
            req.body.participants,
            req.body.group,
            req.file as Express.Multer.File,
            req.user)

        return successResponse({ res, data: result })
    })
chatController.get("/group/:groupId",
    authentication(),
    async (req, res) => {

        const result = await chatService.getGroupChat(
            req.params.groupId as string,
            req.user)

        return successResponse({ res, data: result })
    })



export default chatController;
