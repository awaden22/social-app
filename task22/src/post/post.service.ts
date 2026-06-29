
import { Types } from "mongoose";
import type { CreatePostDto, FindPostDto, NewsFeedDto, UpdatePostDto } from "./post.dto.js";
import userRepo from "../DB/Repo/user.repo.js";
import {
  BadRequestException,
  NotFoundException,
} from "../common/exceptions/domain.exception.js";
import redisServices from "../DB/Models/Redis/redis.services.js";
import notificationService from "../common/Notification/notification.service.js";
import postRepo from "../DB/Repo/post.repo.js";
import s3BuketService from "../common/S3Buket/s3.buket.service.js";
import { PostPrivacyEnum } from "../common/enums/post.enums.js";
import type { IHUser } from "../DB/Models/user.Models.js";
import { populate } from "dotenv";

import commentRepo from "../DB/Repo/comment.repo.js";
import type { ReactionEnums } from "../common/enums/reactions.enums.js";

class PostServices {

  private _userRepo = userRepo;
  private _redisService = redisServices;
  private _notification = notificationService;
  private _postRepo = postRepo;
  private _s3Buket = s3BuketService;
  private _comment = commentRepo;


  async createPost(
    bodydata: any,
    userId: Types.ObjectId | string,
    files: Express.Multer.File[],
  ) {
    const { tags } = bodydata;
    if (tags?.length) {
      const userMentions = await userRepo.find({
        filter: {
          _id: { $in: bodydata.tags },
        },
      });
      if (userMentions.length != bodydata.tags.length) {
        throw new BadRequestException("One or more tagged users not found");
      }
    }

    const post = this._postRepo.getDBDoc(bodydata);
    if (files?.length) {
      const filesPath = await this._s3Buket.uploadfiles({
        files: files as Express.Multer.File[],
        path: `/Post${post?._id}`,
      });
      post.attachment = filesPath.filter(
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
                postId: post?._id,
                message: "You have been mentioned",
              }),
            },
          });
        }
      }
    }
    post.createBy = userId as Types.ObjectId;
    return await this._postRepo.saveDBDoc(post);
  }

  async findPost(user: IHUser, queryData: FindPostDto) {
    const searchQuery = queryData.search?.length
      ? { content: { $regex: queryData.search, $options: "i" } }
      : {};
    return await this._postRepo.paginate({
      filter: {
        $or: await this._postRepo.checkUserPrivacy(user),
        ...searchQuery,

      },
      page: queryData.page as number,
      size: queryData.size as number,
      options: {
        populate: [{
          path: "comments",
          populate: { path: "commentId" }
        }],

      },
    });
  }

  async updatePost(
    bodydata: UpdatePostDto,
    userId: Types.ObjectId | string,
    postId: Types.ObjectId | string,
    files: Express.Multer.File[],
  ) {
    const post = await this._postRepo.findOne({
      filter: {
        _id: postId,
        createBy: userId,
      },
    });
    console.log(bodydata.removeFiles);
    if (!post) {
      throw new NotFoundException("no post found");
    }
    if (
      !post.content &&
      !bodydata.content &&
      !files.length &&
      post.attachment?.length &&
      bodydata.removeFiles?.length == post.attachment.length
    ) {
      throw new BadRequestException("cannnot leave post empty");
    }
    if (bodydata.tags?.length) {
      const userMentions = await userRepo.find({
        filter: {
          _id: { $in: bodydata.tags },
        },
      });
      if (userMentions.length != bodydata.tags.length) {
        throw new BadRequestException("One or more tagged users not found");
      }
    }

    let uploadFiles: string[] = [];
    if (files?.length) {
      const filesPath = await this._s3Buket.uploadfiles({
        files: files as Express.Multer.File[],
        path: `/Post${post?._id}`,
      });
      uploadFiles = filesPath;
    }

    if (bodydata.removeFiles?.length) {
      const removedFiles: { key: string }[] = bodydata.removeFiles.map(
        (path) => {
          return { key: path };
        },
      );
      await this._s3Buket.deleteFile(removedFiles);
    }

    for (const tag of bodydata.tags || []) {
      const token = await this._redisService.getMemberFcmToken(tag);
      if (token.length) {
        await this._notification.sendNotifications({
          tokens: token,
          data: {
            title: "Mention",
            body: JSON.stringify({
              postId: post?._id,
              message: "You have been mentioned",
            }),
          },
        });
      }
    }

    const updatedPost = await this._postRepo.findandUpdate({
      filter: { _id: postId },
      update: [
        {
          $set: {
            content: bodydata.content || post.content,
            privacy: bodydata.privacy || post.privacy,
            tags: {
              $setUnion: [
                {
                  $setDifference: [
                    { $ifNull: ["$tags", []] },
                    bodydata.removetags || [],
                  ],
                },
                bodydata.tags || [],
              ],
            },
            attachment: {
              $setUnion: [
                {
                  $setDifference: [
                    { $ifNull: ["$attachment", []] },
                    bodydata.removeFiles || [],
                  ],
                },
                uploadFiles || [],
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

    return updatedPost;
  }

  async likeorDisklikePost(postId: Types.ObjectId | string, react: number | string, user: IHUser) {

    const updateQuery =
      react == 1
        ? { $addToSet: { likes: user._id } }
        : {
          $pull: { likes: user._id }
        }

    const post = await this._postRepo.findandUpdate({
      filter: {
        _id: postId,
        $or: await this._postRepo.checkUserPrivacy(user)
      },
      update: updateQuery
      ,
      options: {

        returnDocument: "after"
      }
    })
    if (!post) {
      throw new NotFoundException("no found post")
    }
    return post
  }

  async deletePost(postId: Types.ObjectId | string, user: IHUser) {
    const post = await this._postRepo.findById({
      id: postId,
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.createBy.toString() !== user._id.toString()) {
      throw new BadRequestException("You are not authorized to delete this post");
    }
    if (post.attachment?.length) {
      await this._s3Buket.deleteFile(
        post.attachment.map((key) => ({ key })
        )
      )
    }
    const comments = await this._comment.find({
  filter: {
    postId: post._id,
  },
});

const attachments = comments.flatMap(
  (comment) => comment.attachment ?? []
);

if (attachments.length) {
  await this._s3Buket.deleteFile(
    attachments.map((key) => ({ key }))
  );
}

    await this._comment.deleteMany({
      filter: {
        postId: post._id
      },

    })

    await this._postRepo.deleteOne({
      filter: {
        _id: postId
      }
    })
    return {
      message: "Post deleted successfully"
    }



  }

  async reactPost(
    postId: Types.ObjectId | string,
    react: ReactionEnums,
    user: IHUser,
  ) {
    const post = await this._postRepo.findById({
      id: postId,
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const reactionIndex = post.reactions.findIndex(
      (item) => item.userId.toString() === user._id.toString()
    );

    // أول مرة يعمل React
    if (reactionIndex === -1) {
      post.reactions.push({
        userId: user._id,
        reaction: react,
      });
    } else {
      const reaction = post.reactions[reactionIndex];
      // نفس الـ React => يشيله
      if (reaction?.reaction === react) {
        post.reactions.splice(reactionIndex, 1);
      } else if (reaction) {
        // يغير الـ React
        reaction.reaction = react;
      }
    }

    await post.save();

    return post;
  }
  async profilePosts(user: IHUser) {
    const result = await this._postRepo.find({
      filter: {
        $or: [
          { createBy: user._id },
          { tags: user._id }
        ]
      },
      options: {
        populate: [
          {
            path: "comments",
            match: {
              commentId: { $exists: false }
            },
            populate: [{
              path: "replies"
            }]
          },

        ]
      }
    })

    if (!result.length) {
      throw new NotFoundException("post not found")
    }
    return result
  }

  async newsFeed(user: IHUser, query: NewsFeedDto) {
    const page: number = query.page ?? 1;
    const size: number = query.size ?? 10;
    return await this._postRepo.paginate({
      filter: {
        $or: await this._postRepo.checkUserPrivacy(user),
      },
      page,
      size,
      options: {
        sort: {
          createdAt: -1,
        },
        populate: [
          {
            path: "createBy",
            select: "userName profilePics",
          },
          {
            path: "comments",
            match: {
              commentId: { $exists: false },
            },
            populate: {
              path: "replies",
            },
          },
        ],
      },
    });
  }

}

export default new PostServices();
