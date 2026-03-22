const encodeSvg = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const toSafeInitial = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed[0]!.toUpperCase() : "U";
};

const buildAvatarSvg = (name: string): string => {
  const initial = toSafeInitial(name);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" fill="none"><defs><linearGradient id="avatarGradient" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse"><stop stop-color="#143A5E"/><stop offset="1" stop-color="#E67E22"/></linearGradient></defs><rect width="256" height="256" rx="128" fill="url(#avatarGradient)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="112" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#FFF6E9">${initial}</text></svg>`;
};

const buildVenuePlaceholderSvg = (name: string): string => {
  const initial = toSafeInitial(name);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700" fill="none"><defs><linearGradient id="venueGradient" x1="0" y1="0" x2="1200" y2="700" gradientUnits="userSpaceOnUse"><stop stop-color="#143A5E"/><stop offset="1" stop-color="#E67E22"/></linearGradient></defs><rect width="1200" height="700" rx="36" fill="url(#venueGradient)"/><circle cx="1050" cy="120" r="110" fill="#FFF6E9" fill-opacity="0.14"/><circle cx="120" cy="620" r="170" fill="#FFF6E9" fill-opacity="0.08"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-size="220" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#FFF6E9">${initial}</text></svg>`;
};

export const getDefaultAvatarDataUrl = (name: string): string =>
  encodeSvg(buildAvatarSvg(name));

export const getDefaultVenueImageDataUrl = (name: string): string =>
  encodeSvg(buildVenuePlaceholderSvg(name));
