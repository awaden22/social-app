import z from "zod";
import { commonValidationFields } from "../Middlewares/validation.middleware.js";
import { Types } from "mongoose";

export const createCommentSchema = {
  body: z
    .object({
      content: z.string().min(5).max(1000).optional(),
      
      tags: z.array(commonValidationFields.id).optional(),
    })
    .superRefine((arg, ctx) => {
      // لازم content أو files (files تتعمل في service مش هنا)
      if (!arg.content?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "you should add content",
        });
      }

      // tags validation
      if (arg.tags?.length) {
        const invalidTags = arg.tags.filter(
          (tag) => !Types.ObjectId.isValid(tag)
        );

        if (invalidTags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: `invalid tags objectId(s)`,
          });
        }

        const uniqueTags = [...new Set(arg.tags)];
        if (uniqueTags.length !== arg.tags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "duplicated values",
          });
        }
      }
    }),
};
export const updateCommentSchema = {
  body: z
    .object({
      content: z.string().min(5).max(1000).optional(),
      files: z.array(z.any()).optional(),

      tags: z.array(commonValidationFields.id).optional(),
     
    })
    .superRefine((arg, ctx) => {
      if (!arg.files?.length && !arg.content?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "you should add files or content",
        });
      }
      if (arg.tags) {
        const uniqueTags = [...new Set(arg.tags)];
        if (uniqueTags.length != arg.tags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "duplicated values",
          });
        }
      }
    }),
};