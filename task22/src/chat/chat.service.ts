import type { ObjectId } from "mongoose";
import redisServices from "../DB/Models/Redis/redis.services.js";
import userRepo from "../DB/Repo/user.repo.js";
import type { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import s3BuketService from "../common/S3Buket/s3.buket.service.js";
import type { IHUser } from "../DB/Models/user.Models.js";

import chatRepo from "../DB/Repo/chat.repo.js";
import { NotFoundException } from "../common/exceptions/domain.exception.js";
import { ChatType } from "../common/enums/chat.enums.js";
import notificationService from "../common/Notification/notification.service.js";
import { randomUUID } from "node:crypto";


class UserService {
  constructor() { }
  private _chatRepo = chatRepo
  private _userRepo = userRepo
  private _s3bucketService = s3BuketService
  async getChat(participantsId: string, user: IHUser) {
    const chat = await this._chatRepo.findOne({
      filter: {
        participants: {
          $all: [user._id, Types.ObjectId.createFromHexString(participantsId)]
        },
        type: ChatType.OVO
      },
      options: {
        populate: [{ path: "participants" }]
      }
    })
    console.log("current user =", user._id);
    console.log("participant =", participantsId);
    console.log("chat =", chat);
    if (!chat) {
      throw new NotFoundException("chat not found")
    }
    return { chat }
  }

  async sendMessage(bodydata: any, user: IHUser) {
    const { content, sendTo } = bodydata
    const chat = await this._chatRepo.findandUpdate({
      filter: {
        participants: {
          $all: [user._id, Types.ObjectId.createFromHexString(sendTo)]
        },
        type: ChatType.OVO
      },
      update: {
        $push: {
          messages: {
            content,
            createBy: user._id
          }
        }
      }
    })
    if (!chat) {
      await this._chatRepo.create({
        data: {
          participants:
            [user._id, Types.ObjectId.createFromHexString(sendTo)],
          messages: [{
            content,
            createBy: user._id
          }],
          createBy: user._id,
          type: ChatType.OVO
        },
      })
    }

  }
  async createGroup(participants: string[],
    groupName: string,
    file: Express.Multer.File,
    user: IHUser
  ) {
    const users = await this._userRepo.find({
      filter: {
        _id: { $in: participants }
      }
    })
    if (users.length != participants.length) {
      throw new NotFoundException("fail to find all user")
    }
  

    const roomId = randomUUID()
    let groupPath: string = ""
    if (file) {
      groupPath = await this._s3bucketService.upload({
        file,
        path: `chat/group/${roomId}`
      }) as string
    }
    await this._chatRepo.create({
      data: {

        participants: [user._id,
        ...participants.map((id) => 
          Types.ObjectId.createFromHexString(id)
        ),
        ],
        createBy: user._id,
        type: ChatType.OVM,
        group: groupName,
        group_image: groupPath,
        roomId
      },
    })
    

  }
  async getGroupChat (groupId:string,user:IHUser){
    const chat = await this._chatRepo.findOne({
      filter:{
        _id:groupId,
        participants:{
          $in:[user._id]
        },
        type:ChatType.OVM
      },
       options:{
        populate:[
            {path:"participants"},
            {path:"messages.createBy"}
        ]
    }
    })
    if(!chat){
      throw new  NotFoundException("chat no found")
    }
    return {chat}
  }
  async sendGroupMessage(bodydata: any, user: IHUser) {
    const { content,groupId} = bodydata
    const chat = await this._chatRepo.findandUpdate({
      filter: {
        _id:groupId,
        participants: {
          $in: [user._id]
        },
        type: ChatType.OVM
      },
      update: {
        $push: {
          messages: {
            content,
            createBy: user._id
          }
        }
      }
    })
    if (!chat) {
     throw new NotFoundException("no group found")
    }
    return chat.roomId
  }
}
export default new UserService();
