import type {
  PlaceFormData,
  PlaceFormErrors,
  CreateAdminPlaceInput,
} from "../types";

export const EMPTY_PLACE_FORM: PlaceFormData = {
  venueUrl: "",
};

const GOOGLE_DOMAIN_REGEX = /(^|\.)google\.[a-z.]+$/i;
const GOO_GL_DOMAIN_REGEX = /(^|\.)goo\.gl$/i;

const isHttpUrl = (value: string): URL | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
};

export const isGoogleMapsVenueUrl = (value: string): boolean => {
  const parsed = isHttpUrl(value);
  if (!parsed) {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (host === "maps.app.goo.gl") {
    return path.length > 1;
  }

  if (GOO_GL_DOMAIN_REGEX.test(host)) {
    return path.startsWith("/maps");
  }

  if (host.startsWith("maps.google.")) {
    return true;
  }

  if (GOOGLE_DOMAIN_REGEX.test(host) && path.startsWith("/maps")) {
    return true;
  }

  return false;
};

type PlaceFormTranslator = (
  key: string,
  values?: Record<string, string | number>,
  fallback?: string,
) => string;

export const validatePlaceForm = (
  form: PlaceFormData,
  translate?: PlaceFormTranslator,
): PlaceFormErrors => {
  const message = (
    key: string,
    fallback: string,
    values?: Record<string, string | number>,
  ): string => {
    if (!translate) {
      return fallback;
    }

    return translate(key, values, fallback);
  };

  const errors: PlaceFormErrors = {};
  const normalizedVenueUrl = form.venueUrl.trim();

  if (!normalizedVenueUrl) {
    errors.venueUrl = message(
      "admin.places.form.error.venueUrlRequired",
      "Google Maps URL is required.",
    );
  } else if (!isGoogleMapsVenueUrl(normalizedVenueUrl)) {
    errors.venueUrl = message(
      "admin.places.form.error.venueUrlInvalid",
      "Please enter a valid Google Maps place URL (e.g. maps.app.goo.gl or google.com/maps).",
    );
  }

  return errors;
};

export const toCreatePlaceInput = (
  form: PlaceFormData,
): CreateAdminPlaceInput => ({
  venueUrl: form.venueUrl.trim(),
});
