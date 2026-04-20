import type { AuthErrorCode } from "../constants";
import type { ValidationErrors } from "@/utils/apiError";

export class AuthError extends Error {
  public readonly code: AuthErrorCode;

  public readonly statusCode?: number;

  public readonly validationErrors?: ValidationErrors;

  constructor(
    code: AuthErrorCode,
    message?: string,
    statusCode?: number,
    validationErrors?: ValidationErrors,
  ) {
    super(message ?? code);
    this.name = "AuthError";
    this.code = code;
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;

    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
