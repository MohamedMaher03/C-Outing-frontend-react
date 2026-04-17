import { ApiError } from "@/utils/apiError";
import { AuthError } from "./AuthError";
import {
  getAuthErrorMessage,
  isEmailNotVerifiedError,
} from "./getAuthErrorMessage";
import { normalizeAuthError } from "./normalizeAuthError";

describe("auth error normalization", () => {
  it("returns existing auth error without wrapping", () => {
    const error = new AuthError("INVALID_CREDENTIALS", "Bad credentials", 401);
    expect(normalizeAuthError(error)).toBe(error);
  });

  it("maps api status codes to auth codes", () => {
    const apiError = new ApiError("Request failed with status code 409", 409);

    const normalized = normalizeAuthError(apiError);

    expect(normalized).toBeInstanceOf(AuthError);
    expect(normalized.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("prioritizes validation messages from api errors", () => {
    const apiError = new ApiError("Validation failed", 400, {
      validationErrors: {
        Email: ["Email is invalid"],
      },
    });

    const normalized = normalizeAuthError(apiError);

    expect(normalized.code).toBe("VALIDATION_ERROR");
    expect(normalized.message).toBe("Email is invalid");
  });

  it("maps backend code aliases from error details", () => {
    const apiError = new ApiError("Please verify your email", 400, {
      details: {
        error: {
          code: "EMAIL_UNVERIFIED",
        },
      },
    });

    const normalized = normalizeAuthError(apiError);
    expect(normalized.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("formats auth errors for user-facing messages", () => {
    expect(
      getAuthErrorMessage(new AuthError("INVALID_CREDENTIALS")),
    ).toBeTruthy();

    expect(
      getAuthErrorMessage(
        new AuthError("NETWORK_ERROR", "request timeout exceeded"),
      ),
    ).toContain("taking longer than expected");

    expect(getAuthErrorMessage(new Error("Plain error"))).toBe("Plain error");
  });

  it("detects email-not-verified patterns", () => {
    expect(
      isEmailNotVerifiedError(
        new AuthError("EMAIL_NOT_VERIFIED", "Not verified"),
      ),
    ).toBe(true);

    expect(
      isEmailNotVerifiedError(
        new Error("Please verify your email before login"),
      ),
    ).toBe(true);

    expect(isEmailNotVerifiedError(new Error("Other issue"))).toBe(false);
  });
});
