const VENUE_PATH_PATTERN = /^\/venue(\/|$)/;

export const resolveInAppNotificationDestination = (
  actionUrl?: string,
): string | undefined =>
  actionUrl?.replace(VENUE_PATH_PATTERN, "/venues$1");

export const isInternalAppPath = (path?: string): path is string =>
  Boolean(path?.startsWith("/"));
