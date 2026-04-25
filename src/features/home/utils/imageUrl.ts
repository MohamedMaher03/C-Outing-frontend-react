const GOOGLE_USER_CONTENT_HOST_PATTERN =
  /(^https?:\/\/)?([^/]+\.)?googleusercontent\.com\//i;

const GOOGLE_TRANSFORM_SUFFIX_PATTERN = /=[^/?#]+$/;

const toTrimmedImage = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export const buildHomeImageCandidates = (rawImage: unknown): string[] => {
  const image = toTrimmedImage(rawImage);
  if (!image) {
    return [];
  }

  const candidates = [image];

  // Google-hosted venue images often include a transform suffix that can fail
  // intermittently depending on cache and request context, so keep safe fallbacks.
  if (GOOGLE_USER_CONTENT_HOST_PATTERN.test(image)) {
    const suffixMatch = image.match(GOOGLE_TRANSFORM_SUFFIX_PATTERN);
    if (suffixMatch) {
      const baseUrl = image.slice(0, image.length - suffixMatch[0].length);
      if (baseUrl) {
        candidates.push(`${baseUrl}=s1200`);
        candidates.push(baseUrl);
      }
    }
  }

  return Array.from(new Set(candidates));
};
