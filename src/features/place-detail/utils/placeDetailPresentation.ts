import type {
  MenuItem,
  MetroStation,
  PlaceDetail,
} from "@/features/place-detail/types";
import { PRICE_LEVEL_META } from "@/features/place-detail/utils/priceLevel";

export const PLACE_DETAIL_FACILITY_BADGE_CLASS =
  "gap-1.5 border-accent/35 bg-accent/10 text-accent";

const FOOD_DRINK_VENUE_PATTERN =
  /(restaurant|cafe|coffee|food|drink|bar|bakery|kitchen|grill|bistro|diner|pub|brunch|dessert|juice|tea|lounge|shawarma|pizza)/;

export type PlaceDetailReviewTab = "website" | "social";

export interface PlaceDetailNotificationView {
  show: boolean;
  type: "like" | "favorite" | "report" | null;
  action: "added" | "removed" | "submitted";
}

export interface PlaceDetailChromeView {
  isPrivilegedUser: boolean;
  formattedAverageRating: string;
  descriptionText: string;
  hasDescription: boolean;
  hoursText: string;
  hasHoursData: boolean;
  priceMeta: (typeof PRICE_LEVEL_META)[keyof typeof PRICE_LEVEL_META] | null;
  tagLabels: string[];
  menuItems: MenuItem[];
  menuImagesCount: number;
  hasMenuData: boolean;
  shouldShowMenuCard: boolean;
  nearestMetroStations: MetroStation[];
  showFacilitiesCard: boolean;
  hasWheelchairAccess: boolean;
  acceptsAnyPayment: boolean;
  websiteTotalCount: number;
  socialTotalCount: number;
  socialCountCompact: string;
  notificationToneClass: string;
}

export const isPrivilegedPlaceViewer = (
  role: string | undefined,
): boolean => role === "admin" || role === "moderator";

export const isFoodOrDrinkVenue = (
  category: string | undefined,
  type: string | undefined,
): boolean =>
  FOOD_DRINK_VENUE_PATTERN.test(`${category ?? ""} ${type ?? ""}`.trim().toLowerCase());

export const resolveMenuItems = (place: PlaceDetail | null): MenuItem[] => {
  if (!place) return [];
  if ((place.menus?.length ?? 0) > 0) return place.menus ?? [];
  return (place.menuImagesUrls ?? []).filter(Boolean).map((url) => ({ url }));
};

export const resolveMenuImagesCount = (
  place: PlaceDetail | null,
  menuItems: MenuItem[],
): number =>
  Math.max(
    place?.menuImagesCount ?? 0,
    menuItems.length,
    place?.menuImagesUrls?.length ?? 0,
  );

export const resolveHasMenuData = (
  place: PlaceDetail | null,
  menuItems: MenuItem[],
  menuImagesCount: number,
): boolean =>
  Boolean(place?.menuUrl) || menuImagesCount > 0 || menuItems.length > 0;

export const mergeCuisineAndDietaryTags = (
  cuisines: string[] | undefined,
  dietaryAttributes: string[] | undefined,
): string[] =>
  Array.from(
    new Set([...(cuisines ?? []), ...(dietaryAttributes ?? [])]),
  ).filter(Boolean);

export const resolveWheelchairAccess = (place: PlaceDetail | null): boolean =>
  Boolean(
    place?.wheelchairEntrance ||
      place?.wheelchairSeating ||
      place?.wheelchairCarPark ||
      place?.wheelchairToilet,
  );

export const venueAcceptsAnyPayment = (place: PlaceDetail | null): boolean =>
  Boolean(
    place?.acceptsCards ||
      place?.acceptsDebitCards ||
      place?.acceptsCreditCards ||
      place?.acceptsNfcMobile,
  );

export const resolveShowFacilitiesCard = (
  place: PlaceDetail | null,
  acceptsAnyPayment: boolean,
  hasWheelchairAccess: boolean,
): boolean =>
  Boolean(
    place &&
      (place.hasWifi ||
        place.freeWifi ||
        place.hasToilet ||
        (place.seatingType?.length ?? 0) > 0 ||
        place.hasIndoorSeating ||
        place.hasOutdoorSeating ||
        place.parkingAvailable ||
        place.streetParking ||
        place.lotParking ||
        place.valetParking ||
        place.garageParking ||
        place.multiStoreyParking ||
        place.hasDriveThrough ||
        place.offersDelivery ||
        acceptsAnyPayment ||
        place.assistiveHearingLoop ||
        hasWheelchairAccess),
  );

export const pickNearestMetroStations = (
  stations: MetroStation[] | undefined,
  limit = 3,
): MetroStation[] =>
  [...(stations ?? [])].sort((first, second) => first.rank - second.rank).slice(0, limit);

export const resolveSafeAverageRating = (
  place: PlaceDetail | null,
): number => {
  const candidate = place?.averageRating ?? place?.rating;
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : 0;
};

export const formatPlaceAverageRating = (place: PlaceDetail | null): string =>
  resolveSafeAverageRating(place).toFixed(2);

export const resolveWebsiteReviewTotalCount = (
  paginationTotal: number,
  loadedCount: number,
): number => Math.max(paginationTotal, loadedCount);

export const resolveSocialReviewTotalCount = (
  paginationTotal: number,
  googleMapsRatingCount: number | undefined,
  loadedCount: number,
): number =>
  Math.max(paginationTotal, googleMapsRatingCount ?? 0, loadedCount);

export const resolveSocialCountCompact = (
  socialReviewsLoaded: boolean,
  socialTotalCount: number,
  googleMapsRatingCount: number | undefined,
  formatNumber: (value: number) => string,
): string => {
  if (socialReviewsLoaded) return formatNumber(socialTotalCount);
  if (googleMapsRatingCount !== undefined) {
    return formatNumber(googleMapsRatingCount);
  }
  return "...";
};

export const resolveNotificationToneClass = (
  notification: PlaceDetailNotificationView,
): string => {
  if (notification.type === "like") {
    return "border-primary/30 bg-primary text-primary-foreground";
  }
  if (notification.type === "report") {
    return "border-destructive/30 bg-destructive text-destructive-foreground";
  }
  return "border-accent/35 bg-accent text-accent-foreground";
};

export const resolveNotificationMessageKey = (
  notification: PlaceDetailNotificationView,
): string => {
  if (notification.type === "like") {
    return notification.action === "added"
      ? "placeDetail.notice.placeLiked"
      : "placeDetail.notice.likeRemoved";
  }
  if (notification.type === "report") {
    return "placeDetail.notice.reportSubmitted";
  }
  return notification.action === "added"
    ? "placeDetail.notice.addedToFavorites"
    : "placeDetail.notice.removedFromFavorites";
};

export const buildPlaceDetailChromeView = (
  place: PlaceDetail | null,
  payload: {
    isPrivilegedUser: boolean;
    websiteTotalCount: number;
    socialTotalCount: number;
    socialCountCompact: string;
    notification: PlaceDetailNotificationView;
  },
): PlaceDetailChromeView => {
  const menuItems = resolveMenuItems(place);
  const menuImagesCount = resolveMenuImagesCount(place, menuItems);
  const hasMenuData = resolveHasMenuData(place, menuItems, menuImagesCount);
  const hasWheelchairAccess = resolveWheelchairAccess(place);
  const acceptsAnyPayment = venueAcceptsAnyPayment(place);
  const isFoodVenue = isFoodOrDrinkVenue(place?.category, place?.type);

  return {
    isPrivilegedUser: payload.isPrivilegedUser,
    formattedAverageRating: formatPlaceAverageRating(place),
    descriptionText: place?.description?.trim() ?? "",
    hasDescription: (place?.description?.trim() ?? "").length > 0,
    hoursText: place?.hours?.trim() ?? "",
    hasHoursData: Boolean(place?.hours?.trim()) || place?.isOpen !== undefined,
    priceMeta: place?.priceLevel ? PRICE_LEVEL_META[place.priceLevel] : null,
    tagLabels: mergeCuisineAndDietaryTags(
      place?.cuisines,
      place?.dietaryAttributes,
    ),
    menuItems,
    menuImagesCount,
    hasMenuData,
    shouldShowMenuCard: hasMenuData || isFoodVenue,
    nearestMetroStations: pickNearestMetroStations(place?.metroStations),
    showFacilitiesCard: resolveShowFacilitiesCard(
      place,
      acceptsAnyPayment,
      hasWheelchairAccess,
    ),
    hasWheelchairAccess,
    acceptsAnyPayment,
    websiteTotalCount: payload.websiteTotalCount,
    socialTotalCount: payload.socialTotalCount,
    socialCountCompact: payload.socialCountCompact,
    notificationToneClass: resolveNotificationToneClass(payload.notification),
  };
};

export const shouldShowAccessibleBadge = (
  hasWheelchairAccess: boolean,
  accessibilityScore: number | undefined,
): boolean =>
  hasWheelchairAccess ||
  (accessibilityScore !== undefined && accessibilityScore >= 0.7);

export const SOCIAL_REVIEW_PREFETCH_DELAY_MS = 900;
