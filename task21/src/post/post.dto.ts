import type z from "zod";
import type { createPostSchema, findPostSchema, likeandDislikeSchema, updatePostSchema } from "./post.validation.js";


export type CreatePostDto = z.infer<typeof createPostSchema.body>;


export type FindPostDto = z.infer<typeof findPostSchema.body>;

export type UpdatePostDto = z.infer<typeof updatePostSchema.body>;


export type LikeandDisLikePostDto = z.infer<typeof likeandDislikeSchema.query>;