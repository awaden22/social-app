import type z from "zod";
import type logoutSchema from "./user.validation.js";
import type { updateProfileUserSchema, uploadProfileSchema } from "./user.validation.js";
import type { updatePostSchema } from "../post/post.validation.js";

export type logoutDto = z.infer<
  typeof logoutSchema.body
>;
export type uploadProfileDto = z.infer<typeof uploadProfileSchema.body>

export type UpdateProfileUserDto = z.infer<typeof updateProfileUserSchema.body>