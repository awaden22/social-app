import type { Types } from "mongoose";
;
import storyRepo from "../DB/Repo/story.repo.js";
import userRepo from "../DB/Repo/user.repo.js";

import { BadRequestException } from "../common/exceptions/domain.exception.js";
import s3BuketService from "../common/S3Buket/s3.buket.service.js";
import notificationService from "../common/Notification/notification.service.js";
import redisServices from "../DB/Models/Redis/redis.services.js";
import type { CreateStoryDto } from "./story.dto.js";


class StoryService {

  private _storyRepo = storyRepo
  private _s3buket = s3BuketService
  private _notification = notificationService
  private _redisService = redisServices


  async createStroy(
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
      if (userMentions.length != tags.length) {
        throw new BadRequestException("One or more tagged users not found");
      }

    }
    if (!bodydata.content && (!files || files.length === 0)) {
  throw new BadRequestException(
    "Content or attachment is required",
  );
}

    const story = this._storyRepo.getDBDoc({
      ...bodydata,
      createBy: userId as Types.ObjectId,
    });
    if (files?.length) {
      const filesPath = await this._s3buket.uploadfiles({
        files: files as Express.Multer.File[],
        path: `/Story${story._id}`,
      });
      story.attachment = filesPath.filter(
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
                storyId: story._id,
                message: "You have been mentioned",
              }),
            },
          });
        }
      }
    }
   
    return await this._storyRepo.saveDBDoc(story);
  }

}
export default new StoryService();
