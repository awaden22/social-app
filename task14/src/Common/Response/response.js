import { NODE_ENV } from "../../../config/config.service.js";

export function successResponse({ res, statusCode = 200, data }) {
  return res.status(statusCode).json({ message: "done", data });
}

export function globalErrorResponse(error, req, res, next) {
  return NODE_ENV == "dev"
    ? res.status(error.cause?.statusCode ?? 500).json({
        errMsg: error.message,
        error,
        stack: error.stack,
        extra: error.cause?.extra,
      })
    : res
        .status(error.cause?.statusCode ?? 500)
        .json({
          errMsg: error.message,
          error,
          stack: error.stack,
          extra: error.cause?.extra,
        });
}

export function notFoundException(msg) {
  throw new Error(msg, { cause: { statusCode: 404 } });
}

export function badRequestException(msg, extra) {
  throw new Error(msg, { cause: { statusCode: 400,extra }}, );
}

export function conflictException(msg) {
  throw new Error(msg, { cause: { statusCode: 409 } });
}

export function unauthorizedException(msg) {
  throw new Error(msg, { cause: { statusCode: 401 } });
}

export function forbiddenException(msg) {
  throw new Error(msg, { cause: { statusCode: 403 } });
}
