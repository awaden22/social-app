import type { Response } from "express";

export function successResponse<T>({
  res,
  statusCode = 200,
  msg = "Done",
  data,
}: {
  res: Response;
  statusCode?: number;
  msg?: string;
  data?: T;
}) {
  return res.status(statusCode).json({
    msg,
    data,
  });
}
