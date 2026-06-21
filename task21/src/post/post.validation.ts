import z, { any } from "zod";

import { commonValidationFields } from "../Middlewares/validation.middleware.js";
import { PostPrivacyEnum } from "../common/enums/post.enums.js";
import { Query, Types } from "mongoose";

export const createPostSchema = {
  body: z
    .object({
      content: z.string().min(5).max(1000).optional(),
      files: z.array(z.any()).optional(),
      privacy: z.coerce.number().default(PostPrivacyEnum.PUBLIC),
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
        for (const tag of arg.tags) {
          if (!Types.ObjectId.isValid(tag)) {
            ctx.addIssue({
              code: "custom",
              path: ["tags"],
              message: `invalid tags objectId ${tag}`,
            });
          }
        }

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

export const findPostSchema = {
  body: z.object({
    size: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    search: z.string().optional(),
  }),
};

export const updatePostSchema = {
  body: z
    .object({
      content: z.string().min(5).max(1000).optional(),
      files: z.array(z.any()).optional(),
      removeFiles: z.array(z.any()).optional(),
      privacy: z.coerce.number().optional(),
      tags: z.array(commonValidationFields.id).optional(),
      removetags: z.array(commonValidationFields.id).optional(),
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
export const likeandDislikeSchema = {
  query: z.object({
    react: z.coerce.number()
  })
}