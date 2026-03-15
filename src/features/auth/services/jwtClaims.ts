import type { User, UserRole } from "@/types";
import { AuthError } from "../errors";
import type { AuthTokenApiData } from "../types";

type JwtClaims = Record<string, unknown>;

const CLAIM_KEYS = {
  userId: [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    "nameidentifier",
    "nameid",
    "sub",
  ],
  email: [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    "email",
  ],
  name: ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", "name"],
  firstName: ["FirstName", "firstName", "given_name"],
  lastName: ["LastName", "lastName", "family_name"],
  role: [
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
    "role",
    "roles",
  ],
} as const;

const ALLOWED_ROLES: UserRole[] = ["user", "moderator", "admin"];

const getFirstStringClaim = (
  claims: JwtClaims,
  keys: readonly string[],
): string | null => {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
};

const getRoleClaim = (claims: JwtClaims): string | null => {
  for (const key of CLAIM_KEYS.role) {
    const value = claims[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    if (Array.isArray(value)) {
      const firstString = value.find(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      );
      if (firstString) return firstString.trim();
    }
  }
  return null;
};

const normalizeRole = (role: string | null): UserRole => {
  if (!role) return "user";
  const lowered = role.toLowerCase();
  return ALLOWED_ROLES.includes(lowered as UserRole)
    ? (lowered as UserRole)
    : "user";
};

const decodeBase64UrlUtf8 = (base64Url: string): string => {
  const normalized = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : `${normalized}${"=".repeat(4 - padding)}`;
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const decodeJwtPayload = (token: string): JwtClaims => {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) {
    throw new AuthError("UNKNOWN_ERROR", "Invalid authentication token format");
  }

  try {
    const json = decodeBase64UrlUtf8(parts[1]);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Token payload is not an object");
    }
    return parsed as JwtClaims;
  } catch {
    throw new AuthError(
      "UNKNOWN_ERROR",
      "Unable to decode authentication token",
    );
  }
};

const resolveDisplayName = (claims: JwtClaims, email: string): string => {
  const explicitName = getFirstStringClaim(claims, CLAIM_KEYS.name);
  if (explicitName) return explicitName;

  const firstName = getFirstStringClaim(claims, CLAIM_KEYS.firstName);
  const lastName = getFirstStringClaim(claims, CLAIM_KEYS.lastName);
  const joined = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (joined.length > 0) return joined;

  return email.split("@")[0] || "User";
};

export const buildUserFromAuthToken = (data: AuthTokenApiData): User => {
  const claims = decodeJwtPayload(data.token);

  const userId = getFirstStringClaim(claims, CLAIM_KEYS.userId);
  if (!userId) {
    throw new AuthError(
      "UNKNOWN_ERROR",
      "Token does not include user identifier claim",
    );
  }

  const email = getFirstStringClaim(claims, CLAIM_KEYS.email);
  if (!email) {
    throw new AuthError("UNKNOWN_ERROR", "Token does not include email claim");
  }

  const role = normalizeRole(getRoleClaim(claims));

  return {
    userId,
    email,
    role,
    name: resolveDisplayName(claims, email),
    hasCompletedOnboarding: data.hasCompletedOnboarding ?? role !== "user",
  };
};
