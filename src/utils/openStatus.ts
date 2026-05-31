export type OpenStatus = boolean | null | undefined;

export const normalizeOpenStatus = (value: unknown): OpenStatus => {
  if (value === null) return null;

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1 ? true : value === 0 ? false : undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "1"].includes(normalized)) {
    return true;
  }

  if (["false", "0"].includes(normalized)) {
    return false;
  }

  if (["null", "unknown"].includes(normalized)) {
    return null;
  }

  return undefined;
};
