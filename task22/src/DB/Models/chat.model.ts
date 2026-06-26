import { Schema, type HydratedDocument, Types, model } from "mongoose";
import { PostPrivacyEnum } from "../../common/enums/post.enums.js";
import { ChatType } from "../../common/enums/chat.enums.js";


export interface IMessage {
  content?: string;
  attachment?: string[];

  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];

  createBy: Types.ObjectId;

  deletedAt?: Date;
}

export interface IChat {


  participants: Types.ObjectId[],

  messages:IMessage,
  type: ChatType,

  group:string,
  group_image:string,
  roomId:string,

  createBy: Types.ObjectId;
  deletedAt?: Date;
}

export type HIChat= HydratedDocument<IChat>;


 

const messageSchema = new Schema<IMessage>(
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
const chatSchema = new Schema<IChat>({

 participants: [ {type:Types.ObjectId, ref:"User",required:true}],

  messages:[messageSchema],
  type: {type:String,enum:ChatType,default:ChatType.OVO},

  group:{type:String, required:function():boolean{
    return this.type== ChatType.OVM
  }},
  group_image:{type:String, required:function():boolean{
    return this.type== ChatType.OVM
  }},
  roomId:{type:String, required:function():boolean{
    return this.type== ChatType.OVM
  }},

  createBy: {type:Types.ObjectId, ref:"User",required:true},
  deletedAt: Date,
}

)
chatSchema.pre(["find", "findOne"], function () {
  const query = this.getQuery();

  if (!query.withDeleted) {
    this.setQuery({
      ...query,
      deletedAt: null,
    });
  }
});

// postSchema.virtual("comments", {
//   localField: "_id",
//   foreignField: "postId",
//   ref: "Comment",
//   justOne: true
// })

const chatModel = model<IChat>("Chat", chatSchema);

export default chatModel;
