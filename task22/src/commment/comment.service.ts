
import { Types } from "mongoose";

import userRepo from "../DB/Repo/user.repo.js";
import {
  BadRequestException,
  NotFoundException,
} from "../common/exceptions/domain.exception.js";
import redisServices from "../DB/Models/Redis/redis.services.js";
import notificationService from "../common/Notification/notification.service.js";
import postRepo from "../DB/Repo/post.repo.js";
import s3BuketService from "../common/S3Buket/s3.buket.service.js";

import type { IHUser } from "../DB/Models/user.Models.js";
import commentRepo from "../DB/Repo/comment.repo.js";
import type { IPost } from "../DB/Models/post.model.js";
import type { UpdatePostDto } from "../post/post.dto.js";
import type { UpdateCommentDto } from "./comment.dto.js";

class CommentServices {
  private _userRepo = userRepo;
  private _redisService = redisServices;
  private _notification = notificationService;
  private _postRepo = postRepo;
  private _s3Buket = s3BuketService;
  private _commentRepo = commentRepo

  async createComment(
    bodydata: any,
    user: IHUser,
    postId: Types.ObjectId | string,
    files: Express.Multer.File[],
  ) {
    const { tags } = bodydata;

    const post = await this._postRepo.findOne({
      filter: {
        _id: postId,
        $or:
          await this._commentRepo.checkUserPrivacy(user)

      }
    })
    if (!post) {
      throw new NotFoundException("post not found")
    }
    const comment = this._commentRepo.getDBDoc(bodydata)

    if (tags?.length) {
      const userMentions = await this._userRepo.find({
        filter: {
          _id: { $in: bodydata.tags },
        },
      });
      if (userMentions.length != bodydata.tags.length) {
        throw new BadRequestException("One or more tagged users not found");
      }
    }

    if (files?.length) {
      const filesPath = await this._s3Buket.uploadfiles({
        files: files as Express.Multer.File[],
        path: `/Post${post?._id}/Comment${comment?._id}`,
      });
      comment.attachment = filesPath.filter(
        (file): file is string => file !== undefined,
      );
    }

    if (bodydata.tags?.length) {
      for (const tag of bodydata.tags) {
        const token = await this._redisService.getMemberFcmToken(tag);
        if (token.length) {
          await this._notification.sendNotifications({
            tokens: token,
            data: {
              title: "Mention",
              body: JSON.stringify({
                commentId: comment?._id,
                message: "You have been mentionedon on a comment",
              }),
            },
          });
        }
      }
    }
    comment.postId = post._id as Types.ObjectId;
    comment.createBy = user._id as Types.ObjectId;

    return await this._commentRepo.saveDBDoc(comment);
  }
  async replyComment(
    bodydata: any,
    user: IHUser,
    postId: Types.ObjectId | string,
    commentId: Types.ObjectId | string,
    files: Express.Multer.File[],
  ) {
    const { tags } = bodydata;

    const parentComment = await this._commentRepo.findOne({
      filter: {
        _id: commentId,
        postId

      },
      options: {
        populate: [{
          path: "postId",
          match: {
            $or: await this._postRepo.checkUserPrivacy(user)
          }

        }]
      }
    })
    if (!parentComment || !(parentComment.postId as IPost)) {
      throw new NotFoundException("post not found")
    }
    console.log(parentComment)
    const comment = this._commentRepo.getDBDoc(bodydata)

    if (tags?.length) {
      const userMentions = await this._userRepo.find({
        filter: {
          _id: { $in: bodydata.tags },
        },
      });
      if (userMentions.length != bodydata.tags.length) {
        throw new BadRequestException("One or more tagged users not found");
      }
    }

    if (files?.length) {
      const filesPath = await this._s3Buket.uploadfiles({
        files: files as Express.Multer.File[],
        path: `/Post${postId}/Comment${comment?._id}`,
      });
      comment.attachment = filesPath.filter(
        (file): file is string => file !== undefined,
      );
    }

    if (bodydata.tags?.length) {
      for (const tag of bodydata.tags) {
        const token = await this._redisService.getMemberFcmToken(tag);
        if (token.length) {
          await this._notification.sendNotifications({
            tokens: token,
            data: {
              title: "Mention",
              body: JSON.stringify({
                commentId: comment?._id,
                message: "You have been mentionedon on a comment",
              }),
            },
          });
        }
      }
    }
    comment.postId = postId as Types.ObjectId;
    comment.createBy = user._id
    comment.commentId = commentId as Types.ObjectId;

    return await this._commentRepo.saveDBDoc(comment);
  }
 async updateComment(
  bodydata: UpdateCommentDto,
  userId: Types.ObjectId | string,
  commentId: Types.ObjectId | string,
  files: Express.Multer.File[],
) {
  const comment = await this._commentRepo.findOne({
    filter: {
      _id: commentId,
      createBy: userId,
    },
  });

  if (!comment) {
    throw new NotFoundException("Comment not found");
  }

  // منع أن يصبح الكومنت فارغًا
  if (
    !bodydata.content &&
    !files.length &&
    !comment.attachment?.length
  ) {
    throw new BadRequestException("Comment cannot be empty");
  }

  // التحقق من الـ Tags
  if (bodydata.tags?.length) {
    const userMentions = await this._userRepo.find({
      filter: {
        _id: { $in: bodydata.tags },
      },
    });

    if (userMentions.length !== bodydata.tags.length) {
      throw new BadRequestException("One or more tagged users not found");
    }
  }

  let uploadFiles: string[] = [];

  if (files.length) {
    uploadFiles = await this._s3Buket.uploadfiles({
      files,
      path: `/Post${comment.postId}/Comment${comment._id}`,
    });
  }

  // إرسال إشعارات الـ Mention
  if (bodydata.tags?.length) {
    await Promise.all(
      bodydata.tags.map(async (tag) => {
        const tokens = await this._redisService.getMemberFcmToken(tag);

        if (tokens.length) {
          await this._notification.sendNotifications({
            tokens,
            data: {
              title: "Mention",
              body: JSON.stringify({
                commentId: comment._id,
                message: "You have been mentioned on a comment",
              }),
            },
          });
        }
      }),
    );
  }

  const updatedComment = await this._commentRepo.findandUpdate({
    filter: {
      _id: commentId,
    },
    update: [
      {
        $set: {
          content: bodydata.content ?? comment.content,
          tags: bodydata.tags ?? comment.tags,
          attachment: {
            $setUnion: [
              { $ifNull: ["$attachment", []] },
              uploadFiles,
            ],
          },
        },
      },
    ],
    options: {
      returnDocument: "after",
      updatePipeline: true,
    },
  });

  return updatedComment;
}

  async getCommentDetails(
    commentId: Types.ObjectId | string,
    user: IHUser
  ) {
    const comment = await this._commentRepo.findById({

      id: commentId,
      options: {
        populate: [
          {
            path: "postId",
            match: {
              $or: await this._postRepo.checkUserPrivacy(user)
            }
          }, {
            path: "commentId"
          }
        ]
      }
    })
    if (!comment) {
      throw new NotFoundException("post not found")
    }
    return comment

  }
  
  async deleteComment(commentId: Types.ObjectId | string, user: IHUser) {


    const comment = await this._commentRepo.findOne({
      filter: {
        _id: commentId,
        createBy: user._id
      }
    })
    if (!comment) {
      throw new NotFoundException("comment not found")
    }
    if (comment.attachment?.length) {
      await this._s3Buket.deleteFile(
        comment.attachment.map((key) => ({ key })
        )
      )
    }
    await this._commentRepo.deleteOne({
      filter: {
        _id: commentId
      }
    })
    return {
      message: "Comment deleted successfully",
    };


  }
}

export default new CommentServices();
