import type { RegisterRequest } from "../types";

const DEFAULT_AVATAR_MIME = "image/svg+xml";

const toSafeInitial = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed[0]!.toUpperCase() : "U";
};

const buildDefaultAvatarSvg = (name: string): string => {
  const initial = toSafeInitial(name);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" fill="none"><defs><linearGradient id="avatarGradient" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse"><stop stop-color="#143A5E"/><stop offset="1" stop-color="#E67E22"/></linearGradient></defs><rect width="256" height="256" rx="128" fill="url(#avatarGradient)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="112" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#FFF6E9">${initial}</text></svg>`;
};

const buildDefaultAvatarFile = (name: string): File => {
  const svg = buildDefaultAvatarSvg(name);
  return new File([svg], "default-avatar.svg", { type: DEFAULT_AVATAR_MIME });
};

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
  formData.append(
    "Avatar",
    payload.avatar ?? buildDefaultAvatarFile(payload.name),
  );

  return {
    formData,
    params: {
      DateOfBirth: buildDateOfBirthParam(payload.dateOfBirth),
    },
  };
};
