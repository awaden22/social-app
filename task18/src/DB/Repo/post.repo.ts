import type { ObjectId } from "mongoose";
import type { IPost } from "../Models/post.model.js";
import postModel from "../Models/post.model.js";
import DBRepo from "./db.repo.js";
import type { IHUser } from "../Models/user.Models.js";
import { PostPrivacyEnum } from "../../common/enums/post.enums.js";

class PostRepo extends DBRepo<IPost> {
  constructor() {
    super(postModel);
  }
  public async checkUser(id: ObjectId): Promise<boolean> {
    return (await this.findOne({ filter: { _id: id } })) != null;
  }
  public async checkUserPrivacy(user: IHUser) {
    return [
      { privacy: PostPrivacyEnum.PUBLIC },
      {
        createBy: { $in: user.friends! },
        privacy: PostPrivacyEnum.FRIEND,
      },
      {
        tags: { $in: [user._id] },
      },
      {
        createBy: user._id,
      },
    ];
  }
}

export default new PostRepo();
