import { Schema, type HydratedDocument, Types, model } from "mongoose";
import { PostPrivacyEnum } from "../../common/enums/post.enums.js";
import type { IPost } from "./post.model.js";

export interface IComment {
  content?: string;
  attachment?: string[];

  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];

commentId:Types.ObjectId;
postId:Types.ObjectId| IPost;
  createBy: Types.ObjectId;

  deletedAt?: Date;
}

export type HIComment = HydratedDocument<IComment>;

const commentSchema = new Schema<IComment>(
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

   

    deletedAt: {
      type: Date,
      default: null,
    },

    createBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
      commentId: {
      type: Types.ObjectId,
      ref: "Comment",
     
    },
      postId: {
      type: Types.ObjectId,
      ref: "Post",
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
commentSchema.pre(["find", "findOne"], function () {
  const query = this.getQuery();

  if (!query.withDeleted) {
    this.setQuery({
      ...query,
      deletedAt: null,
    });
  }
});

commentSchema.virtual("replies",{
  localField:"_id",
  foreignField:"commentId",
  ref:"Comment"
  
})

const commentModel = model<IComment>("Comment", commentSchema);

export default commentModel;
