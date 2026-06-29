import type z from "zod";
import type { createCommentSchema, updateCommentSchema } from "./comment.validation.js";



export type CreateCommentDto = z.infer<typeof createCommentSchema.body>;


export type UpdateCommentDto = z.infer<typeof updateCommentSchema.body>;