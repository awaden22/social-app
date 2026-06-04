import type z from "zod";
import type logoutSchema from "./user.validation.js";

export type logoutDto = z.infer<
  typeof logoutSchema.body
>;