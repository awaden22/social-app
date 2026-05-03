import mongoose from "mongoose";
import {
  GenderEnums,
  Provider,
  RoleEnums,
} from "../../Common/Enums/enums.user.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true, // ✅ مش require
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () { // ✅ استخدم function مش arrow
        return this.provider === Provider.System;
      },
    },

    provider: {
      type: String,
      enum: Object.values(Provider), // ✅ enum مش enums
      default: Provider.System,
    },

    DOB: Date,
    phone: String,
    profilePic: String,
    coverPics: [String],

    Gender: {
      type: String,
      enum: Object.values(GenderEnums),
      default: GenderEnums.Male,
    },

    role: {
      type: String,
      enum: Object.values(RoleEnums),
      default: RoleEnums.User,
    },

    confirmPassword: {
      type: String,
      default: false,
    },

    confirmEmail: {
      type: Boolean,
      default: false,
    },

    changeCreditTime: Date,

    is2FAEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

export const UserModel = mongoose.model("user", userSchema);
export default UserModel;