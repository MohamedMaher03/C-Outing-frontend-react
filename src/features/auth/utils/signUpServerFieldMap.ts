import type { FieldPath } from "react-hook-form";
import type { SignUpFormInput } from "@/features/auth/validation/signUp.schema";
import { SIGN_UP_BACKEND_FIELD_MAP } from "@/utils/SignUpForm.constants";

export const mapSignUpServerFieldToForm = (
  backendField: string,
): FieldPath<SignUpFormInput> | undefined => {
  const normalized = backendField
    .trim()
    .split(".")
    .pop()
    ?.replace(/\[[0-9]+\]/g, "")
    .toLowerCase();

  return normalized ? SIGN_UP_BACKEND_FIELD_MAP[normalized] : undefined;
};
