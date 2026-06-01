import type { Location } from "react-router-dom";
import { normalizeEmail } from "@/utils/textNormalization";

const RECOVERABLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_VERIFICATION_RESEND_COOLDOWN_SEC = 60;
export const AUTH_SUCCESS_BANNER_DISMISS_MS = 4_000;

export type VerificationEmailRouteState = { email?: string } | null;

export const isRecoverableEmail = (value: string): boolean =>
  RECOVERABLE_EMAIL_PATTERN.test(normalizeEmail(value));

export const resolveVerificationEmail = (
  location: Location,
  pendingVerificationEmail: string,
): string => {
  const routeEmail = normalizeEmail(
    (location.state as VerificationEmailRouteState)?.email ?? "",
  );
  const queryEmail = normalizeEmail(
    new URLSearchParams(location.search).get("email") ?? "",
  );
  return routeEmail || queryEmail || pendingVerificationEmail || "";
};

export const buildVerifyEmailRoute = (email: string) =>
  `/verify-email?email=${encodeURIComponent(email)}` as const;
