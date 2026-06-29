import { Schema, type HydratedDocument, Types, model } from "mongoose";
import { PostPrivacyEnum } from "../../common/enums/post.enums.js";
import { ReactionEnums } from "../../common/enums/reactions.enums.js";

export interface IReaction {
  userId: Types.ObjectId;
  reaction: ReactionEnums;
}

export interface IPost {
  content?: string;
  attachment?: string[];

  tags?: Types.ObjectId[];

  privacy: PostPrivacyEnum;

  reactions: IReaction[];

  createBy: Types.ObjectId;
  deletedAt?: Date;
}

export type HIPost = HydratedDocument<IPost>;

const reactionSchema = new Schema<IReaction>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    reaction: {
      type: Number,
      enum: Object.values(ReactionEnums).filter(
        (value) => typeof value === "number"
      ),
      required: true,
    },
  },
  {
    _id: false,
  }
);

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      required: function (): boolean {
        return !this.attachment?.length;
      },
    },

    attachment: {
      type: [String],
      default: [],
    },

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

    reactions: {
      type: [reactionSchema],
      default: [],
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
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
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

postSchema.virtual("comments", {
  localField: "_id",
  foreignField: "postId",
  ref: "Comment",
});

postSchema.virtual("replies", {
  localField: "_id",
  foreignField: "commentId",
  ref: "Comment",
});

const postModel = model<IPost>("Post", postSchema);

export default postModel;