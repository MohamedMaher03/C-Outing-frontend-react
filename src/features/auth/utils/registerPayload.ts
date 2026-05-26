import type { RegisterRequest } from "../types";

const buildDateOfBirthParam = (dateOfBirth: string): string => {
  const trimmed = dateOfBirth.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return trimmed;
};

export interface RegisterPayload {
  formData: FormData;
}

export const buildRegisterPayload = (
  payload: RegisterRequest,
): RegisterPayload => {
  const formData = new FormData();

  formData.append("Name", payload.name);
  formData.append("Email", payload.email);
  formData.append("Password", payload.password);
  formData.append("PhoneNumber", payload.phoneNumber);
  formData.append("DateOfBirth", buildDateOfBirthParam(payload.dateOfBirth));

  if (payload.avatar) {
    formData.append("Avatar", payload.avatar);
  }

  return { formData };
};
