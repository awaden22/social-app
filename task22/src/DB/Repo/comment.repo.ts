
import type { ObjectId } from "mongoose";
import { PostPrivacyEnum } from "../../common/enums/post.enums.js";
import type { IComment } from "../Models/comment.Model.js";
import type { IHUser } from "../Models/user.Models.js";
import DBRepo from "./db.repo.js";
import commentModel from "../Models/comment.Model.js";

class CommentRepo extends DBRepo<IComment> {
  constructor() {
    super(commentModel);
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

export default new CommentRepo();
