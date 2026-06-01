import { AUTH_PASSWORD_RULES } from "@/features/auth/constants";

export interface PasswordStrengthIndicator {
  id: "min" | "upperLower" | "number" | "specialChar";
  label: string;
  satisfied: boolean;
}

export interface PasswordStrengthLabels {
  minChars: string;
  upperLower: string;
  number: string;
  specialChar: string;
}

export const buildPasswordStrengthIndicators = (
  password: string,
  labels: PasswordStrengthLabels,
): PasswordStrengthIndicator[] => [
  {
    id: "min",
    label: labels.minChars,
    satisfied: password.length >= AUTH_PASSWORD_RULES.MIN_LENGTH,
  },
  {
    id: "upperLower",
    label: labels.upperLower,
    satisfied: /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: labels.number,
    satisfied: /\d/.test(password),
  },
  {
    id: "specialChar",
    label: labels.specialChar,
    satisfied: /[^\w\s]/.test(password),
  },
];
