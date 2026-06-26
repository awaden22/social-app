import {
  Schema,
  model,
  connect,
  type HydrateOptions,
  type HydratedDocument,
} from "mongoose";
import {
  GenderEnum,
  ProivderEnum,
  RoleEnum,
} from "../../common/enums/user.enums.js";
import { Types } from "mongoose";

export interface IUser {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  confirmEmail: boolean;
  age: number;
  gender: GenderEnum;
  profilePics: string;
  coverPics: string[];
  Provider: ProivderEnum;
  phone: string;
  role: RoleEnum;
  friends:Types.ObjectId[]
  changeCreditTime: Date;
}

export type IHUser = HydratedDocument<IUser>;

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: function (): boolean {
        return this.Provider == ProivderEnum.System;
      },
    },

    confirmEmail: {
      type: Boolean,
      default: false,
    },

    age: Number,

    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.Male,
    },

    profilePics: String,

    coverPics: [String],

    Provider: {
      type: Number,
      enum: ProivderEnum,
      default: ProivderEnum.System,
    },

    phone: String,
    friends:[{type:Types.ObjectId,ref:"User"}],

    role: {
      type: Number,
      enum: RoleEnum,
      default: RoleEnum.User,
    },

    changeCreditTime: Date,
  },
  {
    timestamps: true,
  },
);

// 3. Create a Model.
const userModel = model<IUser>("User", userSchema);

export default userModel;
