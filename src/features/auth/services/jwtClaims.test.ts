import { buildUserFromAuthToken } from "./jwtClaims";
import { AuthError } from "../errors";

const makeToken = (claims: Record<string, unknown>): string => {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `header.${payload}.signature`;
};

describe("auth jwt claims", () => {
  it("builds user from token claims and normalizes role", () => {
    const token = makeToken({
      sub: "42",
      email: "admin@example.com",
      role: "Admin",
      name: "Admin Name",
    });

    const user = buildUserFromAuthToken({ token });

    expect(user).toEqual({
      userId: "42",
      email: "admin@example.com",
      role: "admin",
      name: "Admin Name",
      hasCompletedOnboarding: true,
    });
  });

  it("derives display name from first and last name claims", () => {
    const token = makeToken({
      nameid: "7",
      email: "user@example.com",
      role: "user",
      FirstName: "Jane",
      LastName: "Doe",
    });

    const user = buildUserFromAuthToken({ token });

    expect(user.name).toBe("Jane Doe");
    expect(user.hasCompletedOnboarding).toBe(false);
  });

  it("respects explicit hasCompletedOnboarding value", () => {
    const token = makeToken({
      sub: "77",
      email: "mod@example.com",
      role: "moderator",
    });

    const user = buildUserFromAuthToken({
      token,
      hasCompletedOnboarding: false,
    });
    expect(user.hasCompletedOnboarding).toBe(false);
  });

  it("throws auth error for malformed token", () => {
    expect(() => buildUserFromAuthToken({ token: "invalid-token" })).toThrow(
      AuthError,
    );
  });

  it("throws auth error when required claims are missing", () => {
    const tokenWithoutEmail = makeToken({ sub: "1" });

    expect(() => buildUserFromAuthToken({ token: tokenWithoutEmail })).toThrow(
      "Token does not include email claim",
    );
  });
});
