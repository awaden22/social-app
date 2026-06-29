import type z from "zod";
import type { createStorySchema } from "./story.validation.js";


export type CreateStoryDto = z.infer<typeof createStorySchema.body>