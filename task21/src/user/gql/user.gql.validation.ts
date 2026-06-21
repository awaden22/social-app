import z from "zod";
import { commonValidationFields } from "../../Middlewares/validation.middleware.js";

export const UploadProfileSchema=z.object({
    userId:commonValidationFields.id,
})