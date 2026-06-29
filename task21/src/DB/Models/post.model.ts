import { Schema, type HydratedDocument, Types, model } from "mongoose";
import { PostPrivacyEnum } from "../../common/enums/post.enums.js";

export interface IPost {
  content?: string;
  attachment?: string[];

  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];

  privacy: PostPrivacyEnum;
  createBy: Types.ObjectId;

  deletedAt?: Date;
}

export type HIPost = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      required: function ():boolean {
        return !this.attachment?.length;
      },
    },

    attachment: {
      type: [String],
      default: [],
    },

    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    tags: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    privacy: {
      type: Number,
      enum: PostPrivacyEnum,
      default: PostPrivacyEnum.PUBLIC,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    createBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toObject:{
      virtuals:true
    },
    toJSON:{
      virtuals:true
    }
  }
);
postSchema.pre(["find", "findOne"], function () {
  const query = this.getQuery();

  if (!query.withDeleted) {
    this.setQuery({
      ...query,
      deletedAt: null,
    });
  }
});

postSchema.virtual("comments",{
  localField:"_id",
  foreignField:"postId",
  ref:"Comment",
  justOne:true
})

const postModel = model<IPost>("Post", postSchema);

export default postModel;
