import { Router, type Request, type Response } from "express";
import { successResponse } from "../common/response/success.response.js";
import cloudFileUpload from "../multer/multer.config.js";
import { validation } from "../Middlewares/validation.middleware.js";

import { authentication } from "../Middlewares/authentication.middleware.js";
import commentService from "./comment.service.js";
import { createCommentSchema, updateCommentSchema } from "./comment.validation.js";

const commentController = Router();

commentController.post(
  "/create-comment/:postId",
  authentication(),
  cloudFileUpload({}).array("attachment", 5),
  validation(createCommentSchema, true),

  async (req: Request, res: Response) => {
    const result = await commentService.createComment(
      req.body,
      req.user,
      req.params.postId as string,
      req.files as Express.Multer.File[],
    );
    successResponse({ res, statusCode: 201, data: result });
  },
)

commentController.post(
  "/:postId/reply/:commentId",
  authentication(),
  cloudFileUpload({}).array("attachment", 5),


  async (req: Request, res: Response) => {
    const result = await commentService.replyComment(
      req.body,
      req.user,
      req.params.postId as string,
      req.params.commentId as string,
      req.files as Express.Multer.File[],
    );
    successResponse({ res, statusCode: 201, data: result });
  },
)

commentController.get(
  "/:commentId",
  authentication(),



  async (req: Request, res: Response) => {
    const result = await commentService.getCommentDetails(
      req.params.commentId as string,
      req.user,

    );
    successResponse({ res, statusCode: 201, data: result });
  },


)

commentController.patch(
  "/update-comment/:commentId", 
  authentication(),
   cloudFileUpload().array("attachment"),
    validation(updateCommentSchema, true)
    , async (req, res) => {
    const data = await commentService.updateComment(req.body, req.user._id, req.params.commentId as string, req.files as Express.Multer.File[])
    return successResponse({ res, data })
})
commentController.delete("/delete-comment/:commentId",authentication(),async(req,res)=>{
  const result = await commentService.deleteComment(req.params.commentId as string ,req.user)
    return successResponse({ res, data:result })
})
export default commentController