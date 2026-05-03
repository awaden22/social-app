
import joi from "joi"
import { badRequestException } from "../src/Common/Response/response.js";
import { GenderEnums } from "../src/Common/Enums/enums.user.js";
import { Types } from "mongoose";

export function validation(schema) {
  return (req, res, next) => {
    const validationErrors = [];
    for (const schemaKey of Object.keys(schema)) {
      const validateResult = schema[schemaKey].validate(req[schemaKey], {
        abortEarly: false,
      });
      req["v"+schemaKey]= validateResult.value
      
      if (validateResult.error?.details.length > 0) {
        validationErrors.push(validateResult.error);
      }
    }
      if (validationErrors.length > 0) {
        return badRequestException("validationErrors",validationErrors);
      
    }

    next();
  };
}
export const commonFieldValidation = {
  userName: joi
    .string()
    .pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/)),
  // email: joi
  //   .string()
  //   .pattern(
  //     new RegExp(
  //       /^\w{3,25}@(gmail|yahoo|outlook|icloud)(.com|.net|.co|.eg){1,4}$/
  //     )
  //   )
  //   .trim(),
  email:joi.string().email().trim(),
  password: joi
    .string()
    .pattern(
      new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,16}/)
    ),
  phone: joi.string().pattern(new RegExp(/^(\\+201|00201|01)(0|1|2|5)\d{8}$/)),
  DOB: joi.date(),
  gender: joi.string().valid(...Object.values(GenderEnums)),
   otp:joi.string().length(6).pattern(new RegExp(/^(\d{6})$/)).required(),
   id :joi.string().custom( validateObjectIdFn).required()
};
export function validateObjectIdFn(value,helpers){
  if(!Types.ObjectId.isValid(value)){
    return helpers.message("invalid object id formate")
  }
}
