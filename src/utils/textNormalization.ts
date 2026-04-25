export const normalizeTrimmed = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export const normalizeLowercase = (value: unknown): string =>
  normalizeTrimmed(value).toLowerCase();

export const normalizeEmail = (value: unknown): string =>
  normalizeLowercase(value);

export const normalizeSearchTerm = (value: unknown): string =>
  normalizeLowercase(value);
