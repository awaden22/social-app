import z from "zod";
import { commonValidationFields } from "../Middlewares/validation.middleware.js";
import { StoryPrivacyEnum } from "../common/enums/story.enums.js";

export const createStorySchema = {
    body: z.object({
        content: z.string().min(5).max(1000).optional(),
      
        privacy: z.coerce.number().default(StoryPrivacyEnum.PUBLIC),
        tags: z.array(commonValidationFields.id).optional(),

    })




}



