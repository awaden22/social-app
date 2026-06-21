import type z from "zod";
import type logoutSchema from "./user.validation.js";
import type { uploadProfileSchema } from "./user.validation.js";

export type logoutDto = z.infer<
  typeof logoutSchema.body
>;
export type uploadProfileDto = z.infer<typeof uploadProfileSchema.body>