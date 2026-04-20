import { normalizeLowercase } from "./textNormalization";

export const parseBooleanEnv = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = normalizeLowercase(value);
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

export const resolveFeatureMockFlag = (
  featureValue: unknown,
  globalValue: unknown,
): boolean => {
  if (typeof featureValue === "string") {
    return parseBooleanEnv(featureValue);
  }

  return parseBooleanEnv(globalValue);
};
