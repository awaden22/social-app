import { Router } from "express";
import { authentication } from "../Middlewares/authentication.middleware.js";
import storyService from "./story.service.js";
import { successResponse } from "../common/response/success.response.js";
import cloudFileUpload from "../multer/multer.config.js";
import { validation } from "../Middlewares/validation.middleware.js";
import { createStorySchema } from "./story.validation.js";


const storyController =Router();

storyController.post("/create-story", authentication(), 
cloudFileUpload({}).array("attachment",5),
validation(createStorySchema,true),
async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  const result = await storyService.createStroy(
    req.body,
    req.user._id,
    req.files as Express.Multer.File[],
  );

  return successResponse({ res, statusCode: 201, data: result });
});


export default storyController;
