export const JOIN_CODE_LENGTH = 6;

export const normalizeSessionCode = (raw: string): string =>
  raw.trim().toUpperCase();

export const sanitizeJoinCodeInput = (raw: string): string =>
  raw
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, JOIN_CODE_LENGTH);

export const isCompleteJoinCode = (code: string): boolean =>
  code.length === JOIN_CODE_LENGTH;
