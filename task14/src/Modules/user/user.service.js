import fs from "node:fs/promises";
import path from "node:path";
import { ENYCRPTION_KEY } from "../../../config/config.service.js";
import { TokenEnums } from "../../Common/Enums/token.enums.js";
import { decrptionData } from "../../Common/Security/encrpt.js";
import {
  generateSignature,
  getSignature,
} from "../../Common/Security/token.js";

import * as DBRepo from "../../DB/db.respository.js";
import * as RedisMethods from "../../DB/redis.service.js";

import UserModel from "../../DB/Models/User.model.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import {
  badRequestException,
  successResponse,
} from "../../Common/Response/response.js";
export async function renewToken(userDate) {
  const { accessSignature } = getSignature(userDate.role);
  const newAccess = generateSignature({ sub: userDate._id }, accessSignature, {
    audience: [userDate.role, TokenEnums.Access],
    expiresIn: 15 * 60,
  });
  return newAccess;
}
export async function uploadProfilePic(userId, file) {
  const result = await DBRepo.updateOne({
    model: UserModel,
    filter: {
      _id: userId,
    },
    data: {
      profilePic: file.finalPath,
    },
  });
  return result;
}
export async function uploadCoverPic(userId, files) {
  const finalPath = files.map((file) => {
    return file.finalPath;
  });

  const result = await DBRepo.updateOne({
    model: UserModel,
    filter: {
      _id: userId,
    },
    data: {
      coverPics: finalPath,
    },
  });
  return result;
}
export async function getAnotherUserProfile(profileID) {
  const result = await DBRepo.findById(
    UserModel,
    profileID,
    "-password -role -confirmPassword -__v -updatedAt -createdAt",
  );
  if (result && result.phone) {
    result.phone = decrptionData(result.phone, ENYCRPTION_KEY);
  }
  return result;
}
export async function logout(userId, Tokendata, logoutOptions) {
  if (logoutOptions == "all") {
    await DBRepo.updateOne({
      model: UserModel,
      filter: { _id: userId },
      data: { changeCreditTime: Date.now() },
    });
  }
  await RedisMethods.set({
    key: RedisMethods.blockListTokenId(userId, Tokendata.jti),
    value: String(Tokendata.jti),
    expire: 60 * 60 * 24 * 365 - (Date.now() / 1000 - Tokendata.iat),
  });
}
export async function removeProfileIamge(userId) {
  // 1. Find the user to get the current profile picture path
  const user = await DBRepo.findById(UserModel, userId);

  if (user?.profilePic) {
    // 2. Construct the absolute path and delete the file from the hard disk
    const fullPath = path.resolve(user.profilePic);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      // Log error if file doesn't exist or can't be deleted, but proceed to clear DB
      console.error(`Failed to delete file at ${fullPath}:`, err.message);
    }
  }

  // 3. Clear the profilePic field in the database
  const result = await DBRepo.updateOne({
    model: UserModel,
    filter: { _id: userId },
    data: { profilePic: "" },
  });
  return result;
}
export async function updatePassword(user, bodydata) {
  const { newPassword, oldPassword } = bodydata;
  const { password } = user;

  const isOldPassword = await compareOperation({
    plainValue: oldPassword,
    hashValue: password,
  });

  if (!isOldPassword) {
    return badRequestException("invalid old password");
  }

  await DBRepo.updateOne({
    model: UserModel,
    filter: { _id: user._id },
    data: {
      password: await hashOperation({ plainText: newPassword }),
      changeCreditTime: Date.now(),
    },
  });

  return {
    success: true,
    message: "Password updated successfully",
  };
}
