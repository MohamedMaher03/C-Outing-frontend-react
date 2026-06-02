import type { FieldPath } from "react-hook-form";
import type { SignUpFormInput } from "@/features/auth/validation/signUp.schema";

export const SIGN_UP_BACKEND_FIELD_MAP: Record<
  string,
  FieldPath<SignUpFormInput>
> = {
  name: "fullName",
  fullname: "fullName",
  email: "email",
  phone: "phone",
  phonenumber: "phone",
  dateofbirth: "dateOfBirth",
  password: "password",
  confirmpassword: "confirmPassword",
  avatar: "avatar",
};

export const COUNTRIES = [
  { code: "+20", label: "Egypt" },
  { code: "+966", label: "Saudi Arabia" },
  { code: "+971", label: "United Arab Emirates" },
  { code: "+962", label: "Jordan" },
  { code: "+965", label: "Kuwait" },
  { code: "+974", label: "Qatar" },
  { code: "+973", label: "Bahrain" },
  { code: "+968", label: "Oman" },
  { code: "+212", label: "Morocco" },
  { code: "+213", label: "Algeria" },
  { code: "+216", label: "Tunisia" },
  { code: "+90", label: "Turkey" },
  { code: "+44", label: "United Kingdom" },
  { code: "+1", label: "United States" },
];

export const DEFAULT_COUNTRY = "+20";
export const CUSTOM_COUNTRY_VALUE = "custom";

export const normalizePhone = (value: string, countryCode: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("+")) return trimmed.replace(/\s+/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;

  if (!countryCode) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `${countryCode}${digits.slice(1)}`;
  }

  if (digits.startsWith(countryCode.replace("+", ""))) {
    return `+${digits}`;
  }

  return `${countryCode}${digits}`;
};
