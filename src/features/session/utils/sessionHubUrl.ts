import { API_ENDPOINTS } from "@/config/api";

const trimTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value.slice(0, -1) : value;

export const resolveSessionHubUrl = (): string => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const normalizedBase = trimTrailingSlash(apiBase);
  const serverOrigin = normalizedBase.endsWith("/api")
    ? normalizedBase.slice(0, -4)
    : normalizedBase;

  return `${serverOrigin}${API_ENDPOINTS.session.hub}`;
};
