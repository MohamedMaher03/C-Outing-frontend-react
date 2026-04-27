import type {
  AdminCategory,
  AdminPlace,
  AdminReview,
  AdminStats,
  AdminUser,
  AdminUserRole,
  RecentActivity,
  SystemSettings,
} from "../types";
import type { PaginatedResponse } from "@/types";

interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface PaginatedDto<T> {
  items: T[];
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

// type AdminReviewsPayload = PaginatedDto<AdminReviewDto> | AdminReviewDto[];

const asDate = (value: string | null | undefined): Date => {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
};

const mapRoleFromNumericCode = (roleCode: number): AdminUserRole => {
  if (roleCode === 2) {
    return "moderator";
  }

  if (roleCode === 3) {
    return "admin";
  }

  return "user";
};

const mapRole = (role: unknown): AdminUserRole => {
  if (typeof role === "number") {
    return mapRoleFromNumericCode(role);
  }

  if (typeof role === "string") {
    const normalized = role.trim().toLowerCase();

    if (normalized === "admin") {
      return "admin";
    }

    if (normalized === "moderator") {
      return "moderator";
    }

    if (normalized === "user") {
      return "user";
    }

    const numericRole = Number(normalized);
    if (Number.isFinite(numericRole)) {
      return mapRoleFromNumericCode(numericRole);
    }
  }

  return "user";
};

const mapPriceRange = (priceRange: number): AdminPlace["priceLevel"] => {
  if (priceRange <= 1) return "price_cheapest";
  if (priceRange === 2) return "cheap";
  if (priceRange === 3) return "mid_range";
  if (priceRange === 4) return "expensive";
  return "luxury";
};

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
};

const mapPriceLevelValue = (
  value: unknown,
): AdminPlace["priceLevel"] | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "price_cheapest" ||
    normalized === "cheap" ||
    normalized === "mid_range" ||
    normalized === "expensive" ||
    normalized === "luxury"
  ) {
    return normalized;
  }

  return undefined;
};

const mapAdminPlaceStatus = (value: unknown): AdminPlace["status"] => {
  if (
    value === "active" ||
    value === "pending" ||
    value === "flagged" ||
    value === "removed"
  ) {
    return value;
  }

  return "active";
};

const mapAdminReviewStatus = (value: unknown): AdminReview["status"] => {
  if (
    value === "published" ||
    value === "pending" ||
    value === "flagged" ||
    value === "removed"
  ) {
    return value;
  }

  return "pending";
};

export const unwrapEnvelope = <T>(payload: ApiEnvelope<T> | T): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "success" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
};

const extractArray = <T>(data: T[] | { items: T[] }): T[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as { items: T[] })?.items))
    return (data as { items: T[] }).items;
  return [];
};

export const mapAdminUser = (dto: AdminUserDto): AdminUser => ({
  userId: dto.id,
  name: dto.name,
  email: dto.email,
  role: mapRole(dto.role),
  status: dto.isBanned ? "banned" : "active",
  joinedDate: asDate(dto.createdAt),
  lastActive: asDate(dto.updatedAt),
  reviewCount: dto.totalInteractions,
  avatar: dto.avatarUrl ?? undefined,
});

export const mapAdminUsersPage = (
  payload: ApiEnvelope<PaginatedDto<AdminUserDto>> | PaginatedDto<AdminUserDto>,
): PaginatedResponse<AdminUser> => {
  const page = unwrapEnvelope(payload);
  const mappedItems = page.items.map(mapAdminUser);

  const pageSize = Math.max(1, Math.trunc(toFiniteNumber(page.pageSize, 10)));
  const pageIndex = Math.max(1, Math.trunc(toFiniteNumber(page.pageIndex, 1)));
  const totalCount = Math.max(
    0,
    Math.trunc(toFiniteNumber(page.totalCount, mappedItems.length)),
  );
  const fallbackTotalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const totalPages = Math.max(
    1,
    Math.trunc(toFiniteNumber(page.totalPages, fallbackTotalPages)),
  );

  return {
    items: mappedItems,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage:
      typeof page.hasPreviousPage === "boolean"
        ? page.hasPreviousPage
        : pageIndex > 1,
    hasNextPage:
      typeof page.hasNextPage === "boolean"
        ? page.hasNextPage
        : pageIndex < totalPages,
  };
};

export const mapAdminPlace = (
  dto: AdminVenueDto,
  reportedVenueIds: Set<string>,
): AdminPlace => ({
  id: dto.id,
  name: dto.name,
  category: dto.category,
  district: dto.district,
  rating: dto.averageRating,
  reviewCount: dto.reviewCount,
  status: reportedVenueIds.has(dto.id)
    ? "flagged"
    : mapAdminPlaceStatus(dto.status),
  createdAt: asDate(dto.createdAt),
  image: dto.thumbnailUrl ?? dto.displayImageUrl ?? "",
  tags: dto.atmosphereTags,
  description: dto.location,
  priceLevel: mapPriceRange(dto.priceRange),
});

export const mapAdminPlacesPage = (
  payload:
    | ApiEnvelope<PaginatedDto<AdminVenueDto>>
    | PaginatedDto<AdminVenueDto>,
  reportedVenueIds: Set<string>,
): PaginatedResponse<AdminPlace> => {
  const page = unwrapEnvelope(payload);

  const mappedItems = page.items.map((item) =>
    mapAdminPlace(item, reportedVenueIds),
  );

  const pageSize = Math.max(1, Math.trunc(toFiniteNumber(page.pageSize, 10)));

  const rawPageIndex = Math.trunc(toFiniteNumber(page.pageIndex, 0));

  const pageIndex = rawPageIndex + 1; // backend zero-based

  const totalCount = Math.max(
    0,
    Math.trunc(toFiniteNumber(page.totalCount, mappedItems.length)),
  );

  const fallbackTotalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const totalPages = Math.max(
    1,
    Math.trunc(toFiniteNumber(page.totalPages, fallbackTotalPages)),
  );

  return {
    items: mappedItems,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage:
      typeof page.hasPreviousPage === "boolean"
        ? page.hasPreviousPage
        : pageIndex > 1,

    hasNextPage:
      typeof page.hasNextPage === "boolean"
        ? page.hasNextPage
        : pageIndex < totalPages,
  };
};

export const mapAdminVenuesPage = (
  payload:
    | ApiEnvelope<PaginatedDto<AdminVenueDto>>
    | PaginatedDto<AdminVenueDto>,
  reportedVenueIds: Set<string>,
): PaginatedResponse<AdminPlace> => {
  const page = unwrapEnvelope(payload);

  const mappedItems = page.items.map((venue) =>
    mapAdminPlace(venue, reportedVenueIds),
  );

  const pageSize = Math.max(1, Math.trunc(toFiniteNumber(page.pageSize, 10)));

  const pageIndex = Math.max(1, Math.trunc(toFiniteNumber(page.pageIndex, 1)));

  const totalCount = Math.max(
    0,
    Math.trunc(toFiniteNumber(page.totalCount, mappedItems.length)),
  );

  const totalPages = Math.max(
    1,
    Math.trunc(
      toFiniteNumber(page.totalPages, Math.ceil(totalCount / pageSize)),
    ),
  );

  return {
    items: mappedItems,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: pageIndex > 1,
    hasNextPage: pageIndex < totalPages,
  };
};

export const mapReportedVenueIds = (
  payload: ApiEnvelope<ReportedVenueDto[]> | ReportedVenueDto[],
): Set<string> => {
  const venues = extractArray(unwrapEnvelope(payload));
  return new Set(venues.map((venue) => venue.id));
};

export const mapCreatedAdminPlace = (
  payload: ApiEnvelope<AdminCreatedVenueDto> | AdminCreatedVenueDto,
): AdminPlace => {
  const place = unwrapEnvelope(payload);
  const explicitPriceLevel = mapPriceLevelValue(place.priceLevel);

  return {
    id: place.id,
    name: place.name,
    category: place.category,
    district: place.district,
    rating: toFiniteNumber(place.rating ?? place.averageRating, 0),
    reviewCount: Math.max(0, Math.trunc(toFiniteNumber(place.reviewCount, 0))),
    status: mapAdminPlaceStatus(place.status ?? "pending"),
    createdAt: asDate(place.createdAt),
    image: place.image ?? place.thumbnailUrl ?? place.displayImageUrl ?? "",
    tags:
      toStringArray(place.tags).length > 0
        ? toStringArray(place.tags)
        : toStringArray(place.atmosphereTags),
    description:
      (typeof place.description === "string" && place.description) ||
      (typeof place.location === "string" ? place.location : ""),
    priceLevel:
      explicitPriceLevel ??
      (typeof place.priceRange === "number"
        ? mapPriceRange(place.priceRange)
        : undefined),
    phone: place.phone ?? undefined,
    website: place.website ?? undefined,
  };
};

const mapAdminReview = (dto: AdminReviewDto): AdminReview => ({
  id: dto.id,
  userId: dto.userId,
  userName: dto.userName,
  userAvatar: dto.userAvatar ?? undefined,
  venueId: dto.venueId,
  venueName: dto.venueName,
  rating: Math.max(0, Math.min(5, Math.round(toFiniteNumber(dto.rating, 0)))),
  comment: dto.comment,
  status: mapAdminReviewStatus(dto.status),
  reportCount: Math.max(0, Math.trunc(toFiniteNumber(dto.reportCount, 0))),
  createdAt: asDate(dto.createdAt),
});

//paginted
export const mapAdminReviews = (
  payload:
    | ApiEnvelope<PaginatedDto<AdminReviewDto>>
    | PaginatedDto<AdminReviewDto>,
): PaginatedResponse<AdminReview> => {
  const page = unwrapEnvelope(payload);

  const mappedItems = page.items.map(mapAdminReview);

  const pageSize = Math.max(1, Math.trunc(toFiniteNumber(page.pageSize, 10)));

  const pageIndex = Math.max(1, Math.trunc(toFiniteNumber(page.pageIndex, 1)));

  const totalCount = Math.max(
    0,
    Math.trunc(toFiniteNumber(page.totalCount, mappedItems.length)),
  );

  const totalPages = Math.max(
    1,
    Math.trunc(
      toFiniteNumber(page.totalPages, Math.ceil(totalCount / pageSize)),
    ),
  );

  return {
    items: mappedItems,
    pageIndex,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: pageIndex > 1,
    hasNextPage: pageIndex < totalPages,
  };
};

export const mapAdminCategories = (
  payload: ApiEnvelope<AdminCategoryDto[]> | AdminCategoryDto[],
): AdminCategory[] => {
  const categories = unwrapEnvelope(payload);

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
      count: Math.max(0, Math.trunc(toFiniteNumber(category.count, 0))),
      color:
        typeof category.color === "string" && category.color.trim().length > 0
          ? category.color
          : "bg-slate-100",
      status: category.status === "inactive" ? "inactive" : "active",
    };
  });
};

export const mapStats = (
  statsPayload: ApiEnvelope<AdminStatsDto> | AdminStatsDto,
  healthPayload: ApiEnvelope<SystemHealthDto> | SystemHealthDto,
  reportsCount: number,
): AdminStats => {
  const stats = unwrapEnvelope(statsPayload);
  const health = unwrapEnvelope(healthPayload);

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
  statsPayload: ApiEnvelope<AdminStatsDto> | AdminStatsDto,
  healthPayload: ApiEnvelope<SystemHealthDto> | SystemHealthDto,
): RecentActivity[] => {
  const stats = unwrapEnvelope(statsPayload);
  const health = unwrapEnvelope(healthPayload);
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
      timestamp: asDate(health.Timestamp),
    },
  ];
};

export const toSystemSettings = (
  healthPayload: ApiEnvelope<SystemHealthDto> | SystemHealthDto,
): SystemSettings => {
  const health = unwrapEnvelope(healthPayload);

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
  const byCategory = new Map<string, number>();

  places.forEach((place) => {
    const current = byCategory.get(place.category) ?? 0;
    byCategory.set(place.category, current + 1);
  });

  return Array.from(byCategory.entries()).map(([category, count]) => ({
    id: category.toLowerCase().replace(/\s+/g, "-"),
    label: category,
    icon: "MapPin",
    count,
    color: "bg-slate-100",
    status: "active",
  }));
};
