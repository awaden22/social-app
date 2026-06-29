import type z from "zod";
import type { createCommentSchema } from "./comment.validation.js";



export type CreateCommentDto = z.infer<typeof createCommentSchema.body>;

