import joi from "joi";
import { commonFieldValidation } from "../../../middleware/validation.middleware.js";

export const sendMessageSchema ={
    body:joi.object({}).keys({
        content: joi.string().min(5).max(1000),
    })
}
export const getMessageSchema={
    params : joi.object().keys({
        messageId : commonFieldValidation.id.required()
    })
}
export const deleteMessageSchema ={
      params : joi.object().keys({
        messageId : commonFieldValidation.id.required()
    })

}