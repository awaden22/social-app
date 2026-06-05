import type { ObjectId } from "mongoose";
import redisServices from "../DB/Models/Redis/redis.services.js";
import userRepo from "../DB/Repo/user.repo.js";
import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import s3BuketService from "../common/S3Buket/s3.buket.service.js";
import type { IHUser } from "../DB/Models/user.Models.js";

class UserService {
  constructor() {}
  private _userRepo = userRepo;
  private _redisMethods = redisServices;
  private _S3BuketService = s3BuketService;

  async logout(
    userId: string | Types.ObjectId,
    Tokendata: JwtPayload,
    logoutOptions: string,
  ) {
    if (logoutOptions == "all") {
      await this._userRepo.updateOne({
        filter: { _id: userId },
        update: { changeCreditTime: Date.now() },
      });
    }
    await this._redisMethods.set(
      this._redisMethods.blockListTokenId(userId as string, Tokendata.jti!),
      String(Tokendata.jti),
      60 * 60 * 24 * 365 - (Date.now() / 1000 - Tokendata.iat!),
    );
  }
  async uploadFilePic(file: Express.Multer.File, user: IHUser) {
    // const key = await this._S3BuketService.upload({file,path:"user"})
    //  const key = await this._S3BuketService.uploadLargeFile({file,path:"user"})
    const { key, url } = await this._S3BuketService.creatPreSigneUrl({
      file,
      path: "user",
    });
    if (user.profilePics) {
      await s3BuketService.deleteFile(user.profilePics);
    }

    user.profilePics = key as unknown as string;
    await user.save();
    return { key, url };
  }

  async uploadCoverFile(files: Express.Multer.File[], user: IHUser) {
    const key = await this._S3BuketService.uploadfiles({
      files,
      path: `user/${user._id}/coverPics`,
    });
    if (user.coverPics.length) {
      if (user.coverPics) {
        await Promise.all(
          user.coverPics.map((coverPic) => {
            return this._S3BuketService.deleteFile(coverPic);
          }),
        );
      }
    }
    user.coverPics = key as string[];
    await user.save();
    return key;
  }
  async deleteFile(user: IHUser) {
    await user.deleteOne();
    if (user.profilePics) {
      await s3BuketService.deleteFile(user.profilePics);
    }
    if (user.coverPics.length) {
      if (user.coverPics) {
        await Promise.all(
          user.coverPics.map((coverPic) => {
            return this._S3BuketService.deleteFile(coverPic);
          }),
        );
      }
    }
  }
}
export default new UserService();
