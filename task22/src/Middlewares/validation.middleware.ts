import type { NextFunction, Request, Response } from "express";
import { z, type ZodType, type ZodError } from "zod";
import { BadRequestException, MapGQLError } from "../common/exceptions/domain.exception.js";
import { GenderEnum } from "../common/enums/user.enums.js";
import { Types } from "mongoose";

type KeyReqType = keyof Request; // keyof Request => "body" | "params" | "query" | .....

export function validation(
  validationSchema: Partial<Record<KeyReqType, ZodType>>,
  filesinBody = false,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrs: { path: PropertyKey[]; message: string }[] = [];

    for (const key of Object.keys(validationSchema) as KeyReqType[]) {
      if (validationSchema[key] == undefined) {
        continue;
      }

      if (key === "body" && filesinBody === true) {
        req.body = req.body || {};
        req.body.files = req.files || [];
      }

      const validationResult = validationSchema[key].safeParse(req[key]);

      if (!validationResult.success) {
        validationErrs.push(
          ...validationResult.error.issues.map((ele) => {
            return { path: ele.path, message: ele.message };
          }),
        );
      } else {
        // Assign the transformed data back to the request object
        // req[key] = validationResult.data;
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

export function validationGQL<T = any>(
  validationSchema: ZodType,
  value: T,
) {
  const validationResult = validationSchema.safeParse(value);

  if (!validationResult.success) {

    MapGQLError(
      new BadRequestException("validation Error", 
        validationResult.error.issues.map((ele) => {
          return { path: ele.path, message: ele.message };
        }),
          )
    
        );
  }
}
export function validationChat<T = any>(
  validationSchema: ZodType,
  value: T,
) {
  const validationResult = validationSchema.safeParse(value);

  if (!validationResult.success) {

  
      new BadRequestException("validation Error", 
        validationResult.error.issues.map((ele) => {
          return { path: ele.path, message: ele.message };
        }),
          )
    
        ;
  }
}









export const commonValidationFields = {
  userName: z.string().min(3).max(12),
  email: z.email(),
  id: z
    .string()
    .refine((value) => Types.ObjectId.isValid(value))
  ,
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,16}$/),

  age: z.number().positive(),
  gender: z.enum(GenderEnum),
  phone: z.string().regex(/^(\+201|00201|01)(0|1|2|5)\d{8}$/),
  otp: z
    .string()
    .length(6)
    .regex(new RegExp(/^(\d{6})$/)),
};
