import { Router, type Request, type Response } from "express";
import { successResponse } from "../common/response/success.response.js";
import cloudFileUpload from "../multer/multer.config.js";
import { validation } from "../Middlewares/validation.middleware.js";
import { createPostSchema, findPostSchema, likeandDislikeSchema, updatePostSchema } from "./post.validation.js";
import postService from "./post.service.js";
import { authentication } from "../Middlewares/authentication.middleware.js";

const postController = Router();

postController.post(
  "/create-post",
  authentication(),
  cloudFileUpload({}).array("attachment", 5),
  validation(createPostSchema, true),

  async (req: Request, res: Response) => {
    const result = await postService.createPost(
      req.body,
      req.user._id,
      req.files as Express.Multer.File[],
    );
    successResponse({ res, statusCode: 201, data: result });
  },
);
postController.get("/getPost", authentication(),validation(findPostSchema,true),async (req, res) => {
  const result = await postService.findPost(req.user, req.query);
  return successResponse({ res, data: result });
});
postController.patch(
  "/update-post/:postId",
  authentication(),
  cloudFileUpload({}).array("attachment", 5),
  validation(updatePostSchema, true), 

  async (req: Request, res: Response) => {
    
    const result = await postService.updatePost(
      req.body,
      req.user._id,
      req.params.postId as string,
      req.files as Express.Multer.File[],
    );
    successResponse({ res, statusCode: 201, data: result });
  },
);
postController.post(
  "/react-post/:postId",
  authentication(),
 
  validation(likeandDislikeSchema, true), 

  async (req: Request, res: Response) => {
    
    const result = await postService.likeorDisklikePost(
       req.params.postId as string,
      req.query.react as string,
      req.user,
   
    );
    successResponse({ res, statusCode: 201, data: result });
  },
);
export default postController;
