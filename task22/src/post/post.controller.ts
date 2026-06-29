import { Router, type Request, type Response } from "express";
import { successResponse } from "../common/response/success.response.js";
import cloudFileUpload from "../multer/multer.config.js";
import { validation } from "../Middlewares/validation.middleware.js";
import { createPostSchema, findPostSchema, NewsFeedSchema, reactionSchema, updatePostSchema } from "./post.validation.js";
import postService from "./post.service.js";
import { authentication } from "../Middlewares/authentication.middleware.js";
import type { ReactionEnums } from "../common/enums/reactions.enums.js";

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
  "/react-post/:postId/react",
  authentication(),
 
  validation(reactionSchema, true), 

  async (req: Request, res: Response) => {
    
    const result = await postService.reactPost(
       req.params.postId as string,
     Number( req.query.react) as ReactionEnums ,
      req.user,
   
    );
    successResponse({ res, statusCode: 201, data: result });
  },
);
postController.delete("/delete-post/:postId",authentication(),async(req,res)=>{
  const data = await postService.deletePost(req.params.postId as string,req.user)
  return successResponse({res,data})
})
postController.get("/profile-posts", authentication(),async (req, res) => {
  const result = await postService.profilePosts(req.user);
  return successResponse({ res, data: result });
});
postController.get("/news-feed", authentication(),validation(NewsFeedSchema,true),async (req, res) => {
  const query = req.query as unknown as { size: number; page: number; search?: string };
  const result = await postService.newsFeed(req.user, query);
  return successResponse({ res, data: result });
});

export default postController;
