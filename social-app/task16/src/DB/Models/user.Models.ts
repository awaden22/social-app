import { Schema, model, connect, type HydrateOptions, type HydratedDocument } from 'mongoose';
import { GenderEnum, ProivderEnum, RoleEnum } from '../../common/enums/user.enums.js';

export interface IUser {
  userName: string;
  email: string;
  password: string;
  confirmPassword:string;
  confirmEmail:boolean;
  age:number;
  gender:GenderEnum;
  profilePics:string;
  coverPics:[string];
  Provide:ProivderEnum;
  phone:string;
  role:RoleEnum;
  changeCreditTime :Date;
}

export type IHUser = HydratedDocument<IUser>

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
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
      return this.Provide == ProivderEnum.System;
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

  Provide: {
    type: Number,
    enum: ProivderEnum,
    default: ProivderEnum.System,
  },

  phone: String,

  role: {
    type: Number,
    enum: RoleEnum,
    default: RoleEnum.User,
  },

  changeCreditTime: Date,
});

// 3. Create a Model.
const userModel = model<IUser>('User', userSchema);

export default userModel