const toSafeInitial = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "U";

  const firstChar = Array.from(trimmed)[0] ?? "U";
  return firstChar.toLocaleUpperCase();
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildDefaultAvatarSvg = (name: string): string => {
  const initial = escapeXml(toSafeInitial(name));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" fill="none"><defs><linearGradient id="avatarGradient" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse"><stop stop-color="#143A5E"/><stop offset="1" stop-color="#E67E22"/></linearGradient></defs><rect width="256" height="256" rx="128" fill="url(#avatarGradient)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="112" font-family="'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" font-weight="700" fill="#FFF6E9">${initial}</text></svg>`;
};

export const buildDefaultAvatarDataUrl = (name: string): string => {
  const svg = buildDefaultAvatarSvg(name);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
