/**
 * Admin Feature — Mock Data
 *
 * Provides realistic mock data for all admin dashboard views.
 * Used during development without a running backend.
 */

import type {
  AdminStats,
  AdminUser,
  AdminPlace,
  AdminReview,
  AdminCategory,
  SystemSettings,
  RecentActivity,
} from "../types";

// ── Helper ───────────────────────────────────────────────────

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Mock Data ────────────────────────────────────────────────

export const MOCK_ADMIN_STATS: AdminStats = {
  totalUsers: 1247,
  totalPlaces: 356,
  totalReviews: 4829,
  totalReports: 23,
  activeUsersToday: 189,
  newUsersThisWeek: 47,
  pendingReviews: 12,
  resolvedReportsThisWeek: 8,
};

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    userId: 1,
    name: "Ahmed Khalil",
    email: "ahmed@couting.app",
    role: "user",
    status: "active",
    joinedDate: new Date("2024-06-15"),
    lastActive: new Date("2026-03-03"),
    reviewCount: 24,
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    userId: 2,
    name: "Sara Mohamed",
    email: "sara@couting.app",
    role: "moderator",
    status: "active",
    joinedDate: new Date("2024-07-20"),
    lastActive: new Date("2026-03-02"),
    reviewCount: 56,
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    userId: 3,
    name: "Omar Hassan",
    email: "omar@couting.app",
    role: "admin",
    status: "active",
    joinedDate: new Date("2024-01-10"),
    lastActive: new Date("2026-03-03"),
    reviewCount: 8,
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    userId: 4,
    name: "Fatima Ali",
    email: "fatima@example.com",
    role: "user",
    status: "active",
    joinedDate: new Date("2025-01-05"),
    lastActive: new Date("2026-03-01"),
    reviewCount: 15,
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    userId: 5,
    name: "Mohamed Nasser",
    email: "m.nasser@example.com",
    role: "user",
    status: "banned",
    joinedDate: new Date("2025-03-12"),
    lastActive: new Date("2026-02-15"),
    reviewCount: 3,
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    userId: 6,
    name: "Layla Ibrahim",
    email: "layla@example.com",
    role: "user",
    status: "active",
    joinedDate: new Date("2025-06-18"),
    lastActive: new Date("2026-03-03"),
    reviewCount: 42,
    avatar: "https://i.pravatar.cc/150?img=16",
  },
  {
    userId: 7,
    name: "Youssef Adel",
    email: "youssef@example.com",
    role: "moderator",
    status: "active",
    joinedDate: new Date("2024-11-22"),
    lastActive: new Date("2026-03-02"),
    reviewCount: 31,
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    userId: 8,
    name: "Nour Samir",
    email: "nour@example.com",
    role: "user",
    status: "suspended",
    joinedDate: new Date("2025-09-01"),
    lastActive: new Date("2026-01-20"),
    reviewCount: 0,
    avatar: "https://i.pravatar.cc/150?img=20",
  },
];

export const MOCK_ADMIN_PLACES: AdminPlace[] = [
  {
    id: "1",
    name: "Nile Felucca Experience",
    category: "Activities",
    district: "Zamalek",
    rating: 4.8,
    reviewCount: 342,
    status: "active",
    createdAt: new Date("2024-03-15"),
    image:
      "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Zooba — Egyptian Street Food",
    category: "Food & Drink",
    district: "Zamalek",
    rating: 4.6,
    reviewCount: 1205,
    status: "active",
    createdAt: new Date("2024-02-10"),
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "The Townhouse Gallery",
    category: "Culture",
    district: "Downtown",
    rating: 4.5,
    reviewCount: 189,
    status: "active",
    createdAt: new Date("2024-05-20"),
    image:
      "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    name: "Suspicious Place XYZ",
    category: "Food & Drink",
    district: "Nasr City",
    rating: 2.1,
    reviewCount: 5,
    status: "flagged",
    createdAt: new Date("2026-01-20"),
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    name: "New Café Pending",
    category: "Food & Drink",
    district: "Maadi",
    rating: 0,
    reviewCount: 0,
    status: "pending",
    createdAt: new Date("2026-02-28"),
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
  },
  {
    id: "6",
    name: "Removed Old Venue",
    category: "Nightlife",
    district: "Agouza",
    rating: 3.2,
    reviewCount: 45,
    status: "removed",
    createdAt: new Date("2023-08-10"),
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop",
  },
];

export const MOCK_ADMIN_REVIEWS: AdminReview[] = [
  {
    id: "r1",
    userId: 1,
    userName: "Ahmed Khalil",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    placeId: "1",
    placeName: "Nile Felucca Experience",
    rating: 5,
    comment:
      "Absolutely magical experience! The sunset from the felucca was breathtaking. Highly recommend for couples.",
    status: "published",
    reportCount: 0,
    createdAt: new Date("2026-02-28"),
  },
  {
    id: "r2",
    userId: 4,
    userName: "Fatima Ali",
    userAvatar: "https://i.pravatar.cc/150?img=9",
    placeId: "2",
    placeName: "Zooba",
    rating: 4,
    comment:
      "Great food but the wait times can be long on weekends. The hawawshi is a must-try!",
    status: "published",
    reportCount: 0,
    createdAt: new Date("2026-03-01"),
  },
  {
    id: "r3",
    userId: 5,
    userName: "Mohamed Nasser",
    placeId: "6",
    placeName: "Cairo Jazz Club",
    rating: 1,
    comment:
      "This place is terrible. Contains inappropriate content... [flagged for review]",
    status: "flagged",
    reportCount: 5,
    createdAt: new Date("2026-02-20"),
  },
  {
    id: "r4",
    userId: 6,
    userName: "Layla Ibrahim",
    userAvatar: "https://i.pravatar.cc/150?img=16",
    placeId: "3",
    placeName: "The Townhouse Gallery",
    rating: 5,
    comment:
      "Hidden gem in downtown! The current exhibition is mind-blowing. Free entry too!",
    status: "published",
    reportCount: 0,
    createdAt: new Date("2026-03-02"),
  },
  {
    id: "r5",
    userId: 8,
    userName: "Nour Samir",
    userAvatar: "https://i.pravatar.cc/150?img=20",
    placeId: "1",
    placeName: "Nile Felucca Experience",
    rating: 2,
    comment: "Spam review with links to external sites...",
    status: "pending",
    reportCount: 3,
    createdAt: new Date("2026-03-03"),
  },
  {
    id: "r6",
    userId: 7,
    userName: "Youssef Adel",
    userAvatar: "https://i.pravatar.cc/150?img=11",
    placeId: "7",
    placeName: "Al-Azhar Park",
    rating: 4,
    comment:
      "Beautiful park with amazing views. Great for families. The Lakeside Café is wonderful.",
    status: "published",
    reportCount: 0,
    createdAt: new Date("2026-02-25"),
  },
];

export const MOCK_ADMIN_CATEGORIES: AdminCategory[] = [
  {
    id: "food",
    label: "Food & Drink",
    icon: "UtensilsCrossed",
    count: 124,
    color: "bg-orange-100",
    status: "active",
  },
  {
    id: "nightlife",
    label: "Nightlife",
    icon: "Moon",
    count: 56,
    color: "bg-purple-100",
    status: "active",
  },
  {
    id: "culture",
    label: "Culture & Art",
    icon: "Palette",
    count: 43,
    color: "bg-pink-100",
    status: "active",
  },
  {
    id: "outdoor",
    label: "Outdoors",
    icon: "Trees",
    count: 38,
    color: "bg-green-100",
    status: "active",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "ShoppingBag",
    count: 67,
    color: "bg-blue-100",
    status: "active",
  },
  {
    id: "wellness",
    label: "Wellness",
    icon: "Heart",
    count: 29,
    color: "bg-teal-100",
    status: "active",
  },
  {
    id: "activities",
    label: "Activities",
    icon: "Compass",
    count: 45,
    color: "bg-amber-100",
    status: "active",
  },
  {
    id: "coworking",
    label: "Co-working",
    icon: "Laptop",
    count: 31,
    color: "bg-slate-100",
    status: "inactive",
  },
];

export const MOCK_SYSTEM_SETTINGS: SystemSettings = {
  siteName: "C-Outing",
  maintenanceMode: false,
  maxUploadSize: 5,
  defaultLanguage: "en",
  enableNotifications: true,
  enableReviews: true,
  moderationRequired: true,
  autoFlagThreshold: 3,
};

export const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: "a1",
    type: "user_joined",
    description: "Nour Samir joined C-Outing",
    timestamp: new Date("2026-03-03T10:30:00"),
    userId: 8,
    userName: "Nour Samir",
  },
  {
    id: "a2",
    type: "review_posted",
    description: "Layla Ibrahim reviewed The Townhouse Gallery",
    timestamp: new Date("2026-03-02T18:45:00"),
    userId: 6,
    userName: "Layla Ibrahim",
  },
  {
    id: "a3",
    type: "report_filed",
    description: "Report filed on review by Mohamed Nasser",
    timestamp: new Date("2026-03-02T14:20:00"),
    userId: 5,
    userName: "Mohamed Nasser",
  },
  {
    id: "a4",
    type: "place_added",
    description: "New Café Pending was submitted for review",
    timestamp: new Date("2026-02-28T09:15:00"),
  },
  {
    id: "a5",
    type: "user_joined",
    description: "3 new users joined this week",
    timestamp: new Date("2026-02-27T16:00:00"),
  },
];

// ── Mock Admin API ───────────────────────────────────────────

export const adminMock = {
  async getStats(): Promise<AdminStats> {
    await delay(600);
    return { ...MOCK_ADMIN_STATS };
  },

  async getUsers(): Promise<AdminUser[]> {
    await delay(700);
    return [...MOCK_ADMIN_USERS];
  },

  async updateUserRole(
    userId: number,
    role: "user" | "moderator" | "admin",
  ): Promise<void> {
    await delay(400);
    const user = MOCK_ADMIN_USERS.find((u) => u.userId === userId);
    if (user) user.role = role;
  },

  async updateUserStatus(
    userId: number,
    status: "active" | "banned" | "suspended",
  ): Promise<void> {
    await delay(400);
    const user = MOCK_ADMIN_USERS.find((u) => u.userId === userId);
    if (user) user.status = status;
  },

  async getPlaces(): Promise<AdminPlace[]> {
    await delay(600);
    return [...MOCK_ADMIN_PLACES];
  },

  async updatePlaceStatus(
    placeId: string,
    status: AdminPlace["status"],
  ): Promise<void> {
    await delay(400);
    const place = MOCK_ADMIN_PLACES.find((p) => p.id === placeId);
    if (place) place.status = status;
  },

  async deletePlace(placeId: string): Promise<void> {
    await delay(400);
    console.log(`[Mock] Deleted place ${placeId}`);
  },

  async getReviews(): Promise<AdminReview[]> {
    await delay(600);
    return [...MOCK_ADMIN_REVIEWS];
  },

  async updateReviewStatus(
    reviewId: string,
    status: AdminReview["status"],
  ): Promise<void> {
    await delay(400);
    const review = MOCK_ADMIN_REVIEWS.find((r) => r.id === reviewId);
    if (review) review.status = status;
  },

  async deleteReview(reviewId: string): Promise<void> {
    await delay(400);
    console.log(`[Mock] Deleted review ${reviewId}`);
  },

  async getCategories(): Promise<AdminCategory[]> {
    await delay(500);
    return [...MOCK_ADMIN_CATEGORIES];
  },

  async updateCategory(
    categoryId: string,
    data: Partial<AdminCategory>,
  ): Promise<void> {
    await delay(400);
    console.log(`[Mock] Updated category ${categoryId}`, data);
  },

  async getSettings(): Promise<SystemSettings> {
    await delay(500);
    return { ...MOCK_SYSTEM_SETTINGS };
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    await delay(500);
    Object.assign(MOCK_SYSTEM_SETTINGS, settings);
    console.log("[Mock] Updated system settings", settings);
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    await delay(400);
    return [...MOCK_RECENT_ACTIVITY];
  },
};
