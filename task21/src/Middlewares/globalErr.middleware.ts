import type { NextFunction, Request, Response } from "express";
interface IError extends Error {
  statusCode?: number;
}
function globalErrHandler(
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    msg: err.message,
    cause: err.cause,
    stack: err.stack,
    error: err,
  });
}
export default globalErrHandler;
