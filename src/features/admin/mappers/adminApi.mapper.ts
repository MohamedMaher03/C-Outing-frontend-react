import type { PaginatedResponse } from "@/types";
import {
  coerceFiniteNumberWithFallback,
  coerceStringArray,
  coerceValidDate,
  extractEnvelopeArray,
  mapAdminPaginatedResponse,
  resolveExactCanonicalPriceLevel,
  resolvePriceLevelFromNumeric,
  unwrapSuccessEnvelope,
  type ApiSuccessEnvelope,
} from "@/mapper";
import type {
  AdminCategory,
  AdminPlace,
  AdminPlaceStatusFilter,
  AdminReview,
  AdminStats,
  AdminUser,
  AdminUserRole,
  RecentActivity,
  SystemSettings,
} from "../types";

interface PaginatedDto<TItem> {
  items: TItem[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  birthDate: string | null;
  age: number;
  role: number | string;
  totalInteractions: number;
  isBanned: boolean;
  isEmailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminVenueDto {
  id: string;
  name: string;
  location: string;
  category: string;
  district: string;
  type: string;
  priceRange: number;
  latitude: number;
  longitude: number;
  averageRating: number;
  reviewCount: number;
  displayImageUrl: string | null;
  thumbnailUrl: string | null;
  isOpen: boolean;
  atmosphereTags: string[];
  hasWifi: boolean;
  isSaved: boolean;
  status?: string | null;
  createdAt?: string | null;
}

interface AdminStatsDto {
  totalUsers: number;
  totalVenues: number;
  activeInteractions: number;
  topCategories: string[];
}

interface SystemHealthDto {
  TotalUsers: number;
  TotalVenues: number;
  TotalReviews: number;
  RecentInteractions: number;
  Status: string;
  Timestamp: string;
}

interface ReportedVenueDto {
  id: string;
}

interface AdminCategoryDto {
  id?: string;
  label?: string;
  icon?: string | null;
  count?: number;
  color?: string | null;
  status?: string | null;
}

interface AdminReviewDto {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  userAvatarUrl?: string | null;
  venueId: string;
  venueName: string;
  rating: number;
  comment: string;
  status: string;
  reportCount: number;
  createdAt: string;
}

interface AdminCreatedVenueDto {
  id: string;
  name: string;
  category: string;
  district: string;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  status?: string | null;
  createdAt?: string | null;
  image?: string | null;
  displayImageUrl?: string | null;
  thumbnailUrl?: string | null;
  tags?: string[] | null;
  atmosphereTags?: string[] | null;
  description?: string | null;
  location?: string | null;
  priceLevel?: string | null;
  priceRange?: number | null;
  phone?: string | null;
  website?: string | null;
}

const mapRoleFromNumericCode = (roleCode: number): AdminUserRole => {
  if (roleCode === 2) return "moderator";
  if (roleCode === 3) return "admin";
  return "user";
};

const mapRole = (role: unknown): AdminUserRole => {
  if (typeof role === "number") return mapRoleFromNumericCode(role);

  if (typeof role === "string") {
    const normalized = role.trim().toLowerCase();
    if (normalized === "admin") return "admin";
    if (normalized === "moderator") return "moderator";
    if (normalized === "user") return "user";

    const numericRole = Number(normalized);
    if (Number.isFinite(numericRole))
      return mapRoleFromNumericCode(numericRole);
  }

  return "user";
};

const mapAdminPlaceStatus = (value: unknown): AdminPlace["status"] => {
  if (typeof value !== "string") return "active";

  switch (value.trim().toLowerCase()) {
    case "active":
      return "active";
    case "pending":
      return "pending";
    case "flagged":
      return "flagged";
    case "removed":
    case "rejected":
      return "removed";
    default:
      return "active";
  }
};

const mapAdminReviewStatus = (value: unknown): AdminReview["status"] => {
  if (typeof value !== "string") return "pending";

  switch (value.trim().toLowerCase()) {
    case "approved":
      return "published";
    case "flagged":
      return "flagged";
    case "pending":
      return "pending";
    case "rejected":
      return "removed";
    case "published":
      return "published";
    case "removed":
      return "removed";
    default:
      return "pending";
  }
};

const mapAdminPaginatedPage = <TSource, TDomain>(
  payload: ApiSuccessEnvelope<PaginatedDto<TSource>> | PaginatedDto<TSource>,
  itemMapper: (item: TSource) => TDomain,
  zeroBasedPageIndex = true,
): PaginatedResponse<TDomain> =>
  mapAdminPaginatedResponse(unwrapSuccessEnvelope(payload), itemMapper, {
    zeroBasedPageIndex,
  });

export { unwrapSuccessEnvelope as unwrapEnvelope };

export const mapAdminUser = (dto: AdminUserDto): AdminUser => ({
  userId: dto.id,
  name: dto.name,
  email: dto.email,
  role: mapRole(dto.role),
  status: dto.isBanned ? "banned" : "active",
  joinedDate: coerceValidDate(dto.createdAt),
  lastActive: coerceValidDate(dto.updatedAt),
  reviewCount: dto.totalInteractions,
  avatar: dto.avatarUrl ?? undefined,
});

export const mapAdminUsersPage = (
  payload:
    | ApiSuccessEnvelope<PaginatedDto<AdminUserDto>>
    | PaginatedDto<AdminUserDto>,
): PaginatedResponse<AdminUser> =>
  mapAdminPaginatedPage(payload, mapAdminUser, false);

export const mapAdminPlace = (
  dto: AdminVenueDto,
  reportedVenueIds: Set<string>,
  statusFallback?: AdminPlaceStatusFilter,
): AdminPlace => ({
  id: dto.id,
  name: dto.name,
  category: dto.category,
  district: dto.district,
  rating: dto.averageRating,
  reviewCount: dto.reviewCount,
  status: reportedVenueIds.has(dto.id)
    ? "flagged"
    : mapAdminPlaceStatus(
        dto.status ??
          (statusFallback && statusFallback !== "all"
            ? statusFallback
            : undefined),
      ),
  createdAt: coerceValidDate(dto.createdAt),
  image: dto.displayImageUrl ?? dto.thumbnailUrl ?? "",
  tags: dto.atmosphereTags,
  description: dto.location,
  priceLevel: resolvePriceLevelFromNumeric(dto.priceRange),
});

const mapAdminVenuePage = (
  payload:
    | ApiSuccessEnvelope<PaginatedDto<AdminVenueDto>>
    | PaginatedDto<AdminVenueDto>,
  reportedVenueIds: Set<string>,
  statusFallback?: AdminPlaceStatusFilter,
): PaginatedResponse<AdminPlace> =>
  mapAdminPaginatedPage(payload, (venue) =>
    mapAdminPlace(venue, reportedVenueIds, statusFallback),
  );

export const mapAdminPlacesPage = mapAdminVenuePage;

export const mapAdminVenuesPage = mapAdminVenuePage;

export const mapReportedVenueIds = (
  payload: ApiSuccessEnvelope<ReportedVenueDto[]> | ReportedVenueDto[],
): Set<string> =>
  new Set(
    extractEnvelopeArray(unwrapSuccessEnvelope(payload)).map(
      (venue) => venue.id,
    ),
  );

export const mapCreatedAdminPlace = (
  payload: ApiSuccessEnvelope<AdminCreatedVenueDto> | AdminCreatedVenueDto,
): AdminPlace => {
  const place = unwrapSuccessEnvelope(payload);
  const explicitPriceLevel = resolveExactCanonicalPriceLevel(place.priceLevel);
  const explicitTags = coerceStringArray(place.tags);
  const fallbackTags = coerceStringArray(place.atmosphereTags);

  return {
    id: place.id,
    name: place.name,
    category: place.category,
    district: place.district,
    rating: coerceFiniteNumberWithFallback(place.rating ?? place.averageRating),
    reviewCount: Math.max(
      0,
      Math.trunc(coerceFiniteNumberWithFallback(place.reviewCount)),
    ),
    status: mapAdminPlaceStatus(place.status ?? "pending"),
    createdAt: coerceValidDate(place.createdAt),
    image: place.image ?? place.thumbnailUrl ?? place.displayImageUrl ?? "",
    tags: explicitTags.length > 0 ? explicitTags : fallbackTags,
    description:
      (typeof place.description === "string" && place.description) ||
      (typeof place.location === "string" ? place.location : ""),
    priceLevel:
      explicitPriceLevel ??
      (typeof place.priceRange === "number"
        ? resolvePriceLevelFromNumeric(place.priceRange)
        : undefined),
    phone: place.phone ?? undefined,
    website: place.website ?? undefined,
  };
};

const mapAdminReview = (dto: AdminReviewDto): AdminReview => ({
  id: dto.id,
  userId: dto.userId,
  userName: dto.userName,
  userAvatar: dto.userAvatarUrl ?? dto.userAvatar ?? undefined,
  venueId: dto.venueId,
  venueName: dto.venueName,
  rating: Math.max(
    0,
    Math.min(5, Math.round(coerceFiniteNumberWithFallback(dto.rating))),
  ),
  comment: dto.comment,
  status: mapAdminReviewStatus(dto.status),
  reportCount: Math.max(
    0,
    Math.trunc(coerceFiniteNumberWithFallback(dto.reportCount)),
  ),
  createdAt: coerceValidDate(dto.createdAt),
});

export const mapAdminReviews = (
  payload:
    | ApiSuccessEnvelope<PaginatedDto<AdminReviewDto>>
    | PaginatedDto<AdminReviewDto>,
): PaginatedResponse<AdminReview> =>
  mapAdminPaginatedPage(payload, mapAdminReview);

export const mapAdminCategories = (
  payload: ApiSuccessEnvelope<AdminCategoryDto[]> | AdminCategoryDto[],
): AdminCategory[] => {
  const categories = unwrapSuccessEnvelope(payload);

  return categories.map((category, index) => {
    const label =
      typeof category.label === "string" && category.label.trim().length > 0
        ? category.label
        : `Category ${index + 1}`;

    const id =
      typeof category.id === "string" && category.id.trim().length > 0
        ? category.id
        : label.toLowerCase().replace(/\s+/g, "-");

    return {
      id,
      label,
      icon:
        typeof category.icon === "string" && category.icon.trim().length > 0
          ? category.icon
          : "MapPin",
      count: Math.max(
        0,
        Math.trunc(coerceFiniteNumberWithFallback(category.count)),
      ),
      color:
        typeof category.color === "string" && category.color.trim().length > 0
          ? category.color
          : "bg-slate-100",
      status: category.status === "inactive" ? "inactive" : "active",
    };
  });
};

export const mapStats = (
  statsPayload: ApiSuccessEnvelope<AdminStatsDto> | AdminStatsDto,
  healthPayload: ApiSuccessEnvelope<SystemHealthDto> | SystemHealthDto,
  reportsCount: number,
): AdminStats => {
  const stats = unwrapSuccessEnvelope(statsPayload);
  const health = unwrapSuccessEnvelope(healthPayload);

  return {
    totalUsers: stats.totalUsers,
    totalPlaces: stats.totalVenues,
    totalReviews: health.TotalReviews,
    totalReports: reportsCount,
    activeUsersToday: stats.activeInteractions,
    newUsersThisWeek: 0,
    pendingReviews: reportsCount,
    resolvedReportsThisWeek: 0,
    topCategories: stats.topCategories,
    systemStatus: health.Status,
    healthTimestamp: health.Timestamp,
  };
};

export const toRecentActivity = (
  statsPayload: ApiSuccessEnvelope<AdminStatsDto> | AdminStatsDto,
  healthPayload: ApiSuccessEnvelope<SystemHealthDto> | SystemHealthDto,
): RecentActivity[] => {
  const stats = unwrapSuccessEnvelope(statsPayload);
  const health = unwrapSuccessEnvelope(healthPayload);
  const now = new Date();

  return [
    {
      id: "stats-active-interactions",
      type: "review_posted",
      description: `${stats.activeInteractions} active interactions currently recorded`,
      timestamp: now,
    },
    {
      id: "stats-top-categories",
      type: "place_added",
      description:
        stats.topCategories.length > 0
          ? `Top categories: ${stats.topCategories.slice(0, 3).join(", ")}`
          : "No top categories data returned yet",
      timestamp: now,
    },
    {
      id: "health-status",
      type: "report_filed",
      description: `System status is ${health.Status} (snapshot ${health.Timestamp})`,
      timestamp: coerceValidDate(health.Timestamp),
    },
  ];
};

export const toSystemSettings = (
  healthPayload: ApiSuccessEnvelope<SystemHealthDto> | SystemHealthDto,
): SystemSettings => {
  const health = unwrapSuccessEnvelope(healthPayload);

  return {
    siteName: "C-Outing",
    maintenanceMode: health.Status.toLowerCase() !== "healthy",
    maxUploadSize: 5,
    defaultLanguage: "en",
    enableNotifications: true,
    enableReviews: true,
    moderationRequired: true,
    autoFlagThreshold: 3,
  };
};

export const toDerivedCategories = (places: AdminPlace[]): AdminCategory[] => {
  const venueCountByCategory = places.reduce<Map<string, number>>(
    (counts, place) =>
      counts.set(place.category, (counts.get(place.category) ?? 0) + 1),
    new Map(),
  );

  return Array.from(venueCountByCategory.entries()).map(
    ([category, count]) => ({
      id: category.toLowerCase().replace(/\s+/g, "-"),
      label: category,
      icon: "MapPin",
      count,
      color: "bg-slate-100",
      status: "active" as const,
    }),
  );
};
