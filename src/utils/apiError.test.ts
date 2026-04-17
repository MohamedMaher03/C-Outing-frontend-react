import {
  ApiError,
  extractBackendErrorMessage,
  extractBackendStatusCode,
  extractValidationErrors,
  getErrorMessage,
  getFirstValidationErrorMessage,
  isApiError,
  isLoadFailureError,
  isTransportStatusMessage,
  resolveApiUiErrorState,
} from "./apiError";

describe("utils/apiError", () => {
  it("extracts validation errors from backend payload", () => {
    const payload = {
      errors: {
        Email: ["Email is invalid"],
        Password: ["Password too short"],
      },
    };

    const validation = extractValidationErrors(payload);

    expect(validation).toEqual({
      Email: ["Email is invalid"],
      Password: ["Password too short"],
    });
    expect(getFirstValidationErrorMessage(validation)).toBe("Email is invalid");
  });

  it("extracts backend error message with validation priority", () => {
    const payload = {
      message: "Generic error",
      errors: {
        Name: ["Name is required"],
      },
    };

    expect(extractBackendErrorMessage(payload)).toBe("Name is required");
    expect(extractBackendErrorMessage({ message: "Only message" })).toBe(
      "Only message",
    );
    expect(extractBackendErrorMessage({ title: "Only title" })).toBe(
      "Only title",
    );
  });

  it("extracts backend status code from common shapes", () => {
    expect(extractBackendStatusCode({ statusCode: 422 })).toBe(422);
    expect(extractBackendStatusCode({ status: 500 })).toBe(500);
    expect(extractBackendStatusCode({})).toBeUndefined();
  });

  it("detects api errors and transport status messages", () => {
    const apiError = new ApiError("Request failed with status code 404", 404);

    expect(isApiError(apiError)).toBe(true);
    expect(isApiError({ isApiError: true })).toBe(true);
    expect(isTransportStatusMessage(apiError.message)).toBe(true);
  });

  it("resolves readable messages with status fallbacks", () => {
    const apiError = new ApiError("Request failed with status code 404", 404);

    expect(getErrorMessage(apiError)).toBe(
      "We couldn't find what you were looking for.",
    );
    expect(getErrorMessage(new Error("Boom"))).toBe("Boom");
    expect(getErrorMessage("String error")).toBe("String error");
    expect(getErrorMessage(null, "fallback-message")).toBe("fallback-message");
  });

  it("detects load failures and resolves UI state", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    expect(isLoadFailureError(new Error("Anything"))).toBe(true);

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });

    const forbiddenState = resolveApiUiErrorState(new ApiError("Denied", 403), {
      forbiddenMessage: "Forbidden",
      loadFailureMessage: "Offline",
      genericMessage: "Generic",
    });

    expect(forbiddenState).toEqual({
      kind: "forbidden",
      message: "Forbidden",
      statusCode: 403,
    });

    const loadFailureState = resolveApiUiErrorState(
      new Error("Network timeout"),
      {
        forbiddenMessage: "Forbidden",
        loadFailureMessage: "Offline",
        genericMessage: "Generic",
      },
    );
    expect(loadFailureState.kind).toBe("load-failure");
    expect(loadFailureState.message).toBe("Offline");

    const genericState = resolveApiUiErrorState(new Error("custom"), {
      forbiddenMessage: "Forbidden",
      loadFailureMessage: "Offline",
      genericMessage: "Generic",
    });
    expect(genericState).toEqual({
      kind: "generic",
      message: "custom",
      statusCode: undefined,
    });
  });
});
