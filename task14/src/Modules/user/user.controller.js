import express from "express";
import * as userSercice from "./user.service.js";
import { successResponse } from "../../Common/Response/response.js";
import { authentication } from "../../../middleware/authentication.middleware.js";

import { TokenEnums } from "../../Common/Enums/token.enums.js";
import { authorization } from "../../../middleware/authorization.middleware.js";
import { RoleEnums } from "../../Common/Enums/enums.user.js";
import {
  allowedFileFormat,
  localUpload,
} from "../../Common/Multer/multer.config.js";

import {
  coverPicSchema,
 
  getAnotherUserProfileSchema,
  profilePicSchema,
  updatePasswordSchema,
} from "./user.validtion.js";
import { validation } from "../../../middleware/validation.middleware.js";

const userRouter = express.Router();

userRouter.get(
  "/",
  authentication(),
  authorization([RoleEnums.User]),
  async (req, res) => {
    return successResponse({ res, statusCode: 201, data: req.user });
  },
);

userRouter.post(
  "/renewtoken",
  authentication(TokenEnums.Refresh),
  async (req, res) => {
    const result = await userSercice.renewToken(req.user);
    return successResponse({ res, statusCode: 201, data: result });
  },
);

userRouter.post(
  "/upload-mainPic",
  authentication(),
  localUpload({
    folderName: "User",
    allowedformat: allowedFileFormat.img,
  }).single("profilePic"),
  validation(profilePicSchema),

  async (req, res) => {
    const result = await userSercice.uploadProfilePic(req.user._id, req.file);

    return successResponse({ res, statusCode: 201, data: result });
  },
);

userRouter.post(
  "/upload-coverPic",
  authentication(),
  localUpload({
    folderName: "User",
    allowedformat: allowedFileFormat.img,
  }).array("coverPic"),
  validation(coverPicSchema),

  async (req, res) => {
    const result = await userSercice.uploadCoverPic(req.user._id, req.files);

    return successResponse({ res, statusCode: 201, data: result });
  },
);
userRouter.patch(
  "/update-password",
  authentication(),
  validation(updatePasswordSchema),
  async (req, res) => {
    const result = await userService.updatePassword(req.user, req.body);

    return successResponse({ res, statusCode: 200, data: result });
  },
);

userRouter.get(
  "/share-profile/:profileId",
  validation(getAnotherUserProfileSchema),
  async (req, res) => {
    const result = await userSercice.getAnotherUserProfile(
      req.params.profileId,
    );
    return successResponse({ res, data: result });
  },
);

userRouter.delete("/remove-profile-pic",authentication(),async(req,res)=>{
  const result = await userSercice.removeProfileIamge(req.user._id)
  return successResponse({res , data:result})
})

userRouter.post("/logout", authentication(), async (req, res) => {
  const result = await userSercice.logout(req.user._id, req.payload,req.body.logoutOptions);
  return successResponse({ res, data: result });
});

export default userRouter;
