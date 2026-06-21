import CustomError from "../custom.error.js";

export class BadRequestException extends CustomError {
  constructor(message: string = "Bad Request", cause?: unknown) {
    super(message, 400, cause);
  }
}
export class UnauthorizedException extends CustomError {
  constructor(message: string = "Unauthorized", cause?: unknown) {
    super(message, 401, cause);
  }
}

export class NotFoundException extends CustomError {
  constructor(message: string = "Not Found", cause?: unknown) {
    super(message, 404, cause);
  }
}

export class ConflictException extends CustomError {
  constructor(message: string = "conflict", cause?: unknown) {
    super(message, 409, cause);
  }
}
