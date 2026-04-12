import type { RegisterRequest } from "../types";

const buildDateOfBirthParam = (dateOfBirth: string): string => {
  const trimmed = dateOfBirth.trim();
  // HTML date input returns YYYY-MM-DD; convert to RFC3339 date-time.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00Z`;
  }
  return new Date(trimmed).toISOString();
};

export interface RegisterPayload {
  formData: FormData;
  params: { DateOfBirth: string };
}

export const buildRegisterPayload = (
  payload: RegisterRequest,
): RegisterPayload => {
  const formData = new FormData();

  formData.append("Name", payload.name);
  formData.append("Email", payload.email);
  formData.append("Password", payload.password);
  formData.append("PhoneNumber", payload.phoneNumber);

  if (payload.avatar) {
    formData.append("Avatar", payload.avatar);
  }

  return {
    formData,
    params: {
      DateOfBirth: buildDateOfBirthParam(payload.dateOfBirth),
    },
  };
};
