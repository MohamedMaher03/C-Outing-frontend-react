import { isGoogleMapsVenueUrl } from "@/features/admin/utils/placeForm";

export type VenueUrlFieldPhase = "empty" | "valid" | "invalid";

export interface VenueUrlFieldSnapshot {
  normalizedUrl: string;
  hasInput: boolean;
  isValid: boolean;
  phase: VenueUrlFieldPhase;
}

const VENUE_URL_PHASE_LOOKUP = {
  empty: "empty",
  valid: "valid",
  invalid: "invalid",
} as const satisfies Record<VenueUrlFieldPhase, VenueUrlFieldPhase>;

export const snapshotVenueUrlField = (rawUrl: string): VenueUrlFieldSnapshot => {
  const normalizedUrl = rawUrl.trim();
  const hasInput = normalizedUrl.length > 0;
  const isValid = hasInput && isGoogleMapsVenueUrl(normalizedUrl);
  const phase: VenueUrlFieldPhase = !hasInput
    ? VENUE_URL_PHASE_LOOKUP.empty
    : isValid
      ? VENUE_URL_PHASE_LOOKUP.valid
      : VENUE_URL_PHASE_LOOKUP.invalid;

  return { normalizedUrl, hasInput, isValid, phase };
};

const ADMIN_VENUE_URL_HINT_KEYS: Record<VenueUrlFieldPhase, string> = {
  empty: "admin.places.form.urlHintDefault",
  valid: "admin.places.form.urlHintValid",
  invalid: "admin.places.form.urlHintInvalid",
};

const MODERATOR_VENUE_URL_HINT_KEYS: Record<VenueUrlFieldPhase, string> = {
  empty: "moderator.places.form.urlHintDefault",
  valid: "moderator.places.form.urlHintValid",
  invalid: "moderator.places.form.urlHintInvalid",
};

const VENUE_URL_HINT_FALLBACKS: Record<VenueUrlFieldPhase, string> = {
  empty: "Paste a Google Maps link to continue.",
  valid: "Looks valid. You can start scraping now.",
  invalid: "Invalid URL. Use a Google Maps place link.",
};

type VenueUrlTranslator = (
  key: string,
  values?: Record<string, string | number>,
  fallback?: string,
) => string;

export const resolveAdminVenueUrlHint = (
  phase: VenueUrlFieldPhase,
  translate: VenueUrlTranslator,
): string =>
  translate(
    ADMIN_VENUE_URL_HINT_KEYS[phase],
    undefined,
    VENUE_URL_HINT_FALLBACKS[phase],
  );

export const resolveModeratorVenueUrlHint = (
  phase: VenueUrlFieldPhase,
  translate: VenueUrlTranslator,
): string =>
  translate(
    MODERATOR_VENUE_URL_HINT_KEYS[phase],
    undefined,
    VENUE_URL_HINT_FALLBACKS[phase],
  );

export const venueUrlHintToneClass = (phase: VenueUrlFieldPhase): string =>
  ({
    empty: "text-muted-foreground",
    valid: "text-primary",
    invalid: "text-destructive",
  })[phase];
