export const normalizeTrimmed = (value: string): string => value.trim();

export const normalizeLowercase = (value: string): string =>
  normalizeTrimmed(value).toLowerCase();

export const normalizeEmail = (value: string): string =>
  normalizeLowercase(value);

export const normalizeSearchTerm = (value: string): string =>
  normalizeLowercase(value);
