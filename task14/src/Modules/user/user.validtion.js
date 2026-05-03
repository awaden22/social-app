import joi from "joi";
import { commonFieldValidation, validateObjectIdFn } from "../../../middleware/validation.middleware.js";

export const profilePicSchema={file:
    joi.object().keys({
  fieldname: joi.string().required(),
  originalname: joi.string().required(),
  originalname: joi.string().required(),
  encoding: joi.string().required(),
  mimetype: joi.string().required(),
  finalPath: joi.string().required(),
  destination: joi.string().required(),
  filename: joi.string().required(),
  path: joi.string().required(),
  size: joi.number().required()
}).required()
}
export const coverPicSchema = {
  files: joi.array().items(
    joi.object().keys({
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi.string().required(),
      finalPath: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().required()
    }).required()
  ).required()
}
export const getAnotherUserProfileSchema={
  params:joi.object().keys({
    profileId:joi.string().custom( validateObjectIdFn).required()


  }).required()
}

export const updatePasswordSchema={
  body:joi.object().keys({
    oldPassword:commonFieldValidation.password.required(),
    newPassword:commonFieldValidation.password.required(),
    confirmNewPassword:joi.string().valid(joi.ref("newPassword")).required()
  })
}