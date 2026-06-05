import type { NextFunction, Request, Response } from "express";
import { z, type ZodType, type ZodError } from "zod";
import { BadRequestException } from "../common/exceptions/domain.exception.js";
import { GenderEnum } from "../common/enums/user.enums.js";

type KeyReqType = keyof Request; // keyof Request => "body" | "params" | "query" | .....

export function validation(
  validationSchema: Partial<Record<KeyReqType, ZodType>>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrs: { path: PropertyKey[]; message: string }[] = [];

    for (const key of Object.keys(validationSchema) as KeyReqType[]) {
      if (validationSchema[key] == undefined) {
        continue;
      }

      const validationResult = validationSchema[key].safeParse(req[key]);

      if (!validationResult.success) {
        validationErrs.push(
          ...validationResult.error.issues.map((ele) => {
            return { path: ele.path, message: ele.message };
          }),
        );
      }
    }

    if (validationErrs.length > 0) {
      throw new BadRequestException("invalid validation", {
        validationErrs,
      });
    }

    next();
  };
}

export const commonValidationFields = {
  userName: z.string().min(3).max(12),
  email: z.string().email(),

  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,16}$/),

  age: z.number().positive(),
  gender: z.nativeEnum(GenderEnum),
  phone: z.string().regex(/^(\+201|00201|01)(0|1|2|5)\d{8}$/),
  otp:z.string().length(6).regex(new RegExp(/^(\d{6})$/))
};
