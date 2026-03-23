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
  role: number;
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

const mapRole = (role: number): AdminUserRole => {
  if (role === 2) {
    return "moderator";
  }

  if (role === 3) {
    return "admin";
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
): AdminUser[] => {
  const page = unwrapEnvelope(payload);
  return page.items.map(mapAdminUser);
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
  status: reportedVenueIds.has(dto.id) ? "flagged" : "active",
  createdAt: new Date(),
  image: dto.thumbnailUrl ?? dto.displayImageUrl ?? "",
  tags: dto.atmosphereTags,
  description: dto.location,
  priceLevel: mapPriceRange(dto.priceRange),
});

export const mapAdminVenuesPage = (
  payload:
    | ApiEnvelope<PaginatedDto<AdminVenueDto>>
    | PaginatedDto<AdminVenueDto>,
  reportedVenueIds: Set<string>,
): AdminPlace[] => {
  const page = unwrapEnvelope(payload);
  return page.items.map((venue) => mapAdminPlace(venue, reportedVenueIds));
};

export const mapReportedVenueIds = (
  payload: ApiEnvelope<AdminVenueDto[]> | AdminVenueDto[],
): Set<string> => {
  const venues = unwrapEnvelope(payload);
  return new Set(venues.map((venue) => venue.id));
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

export const emptyReviews: AdminReview[] = [];
