import express from "express";
import { authentication } from "../Middlewares/authentication.middleware.js";
import { successResponse } from "../common/response/success.response.js";
import userService from "./user.service.js";
import { validation } from "../Middlewares/validation.middleware.js";
import logoutSchema from "./user.validation.js";

import cloudFileUpload from "../multer/multer.config.js";
import { StorgeApproachEnum } from "../common/enums/multer.enums.js";
import { Bucket_Name } from "../config/config.service.js";
import chatController from "../chat/chat.controller.js";

const userController = express.Router();
userController.use("/:userId/chat",chatController)
userController.get("/", authentication(), async(req, res) => {
     
  const result = await userService.getUser(req.user)
  return successResponse({ res, data: result });
});
userController.post(
  "/logout",
  authentication(),
  validation(logoutSchema),
  async (req, res) => {
    const result = await userService.logout(
      req.user._id,
      req.Payload,
      req.body.logoutOptions,
    );
    return successResponse({ res, data: result });
  },
);

userController.post(
  "/upload-profile",
  authentication(),
  cloudFileUpload({ storgeApproach: StorgeApproachEnum.Disk }).single(
    "profilePic",
  ),

  async (req, res) => {
    const result = await userService.uploadFilePic(
      req.body,
      req.user,
    );
    return successResponse({
      res,
      msg: "success upload",
      data: result,
    });
  },
);

userController.post(
  "/upload-cover",
  authentication(),
  cloudFileUpload({ storgeApproach: StorgeApproachEnum.Memory }).array(
    "coverPic",
  ),

  async (req, res) => {
    const result = await userService.uploadCoverFile(
      req.files as Express.Multer.File[],
      req.user,
    );
    return successResponse({
      res,
      msg: "success upload",
      data: result,
    });
  },
);

userController.delete(
  "/deleteFile",
  authentication(),

  async (req, res) => {
    const result = await userService.deleteFile(req.user);
    return successResponse({
      res,
      msg: "deleted",
      data: result,
    });
  },
);

export default userController;
