import { normalizeLowercase } from "./textNormalization";

export const parseBooleanEnv = (value: unknown): boolean => {
  const normalized =
    typeof value === "boolean"
      ? String(value)
      : typeof value === "number"
        ? String(value)
        : typeof value === "string"
          ? value
          : "";

  return ["true", "1", "yes"].includes(normalizeLowercase(normalized));
};

export const resolveFeatureMockFlag = (
  featureValue: unknown,
  globalValue: unknown,
): boolean => {
  const prioritizedValue =
    featureValue !== undefined && featureValue !== null
      ? featureValue
      : globalValue;
  return parseBooleanEnv(prioritizedValue);
};
