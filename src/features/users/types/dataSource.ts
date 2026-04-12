import type { PaginatedResponse } from "@/types";

export interface UserProfileDto {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  age?: number;
  role?: number;
  totalInteractions?: number;
  isBanned?: boolean;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
}

export interface UserReviewDto {
  id: string;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  rating: number;
  sentimentScore?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UsersDataSource {
  getCurrentProfile: () => Promise<UserProfileDto>;
  getPublicProfile: (userId: string) => Promise<UserProfileDto>;
  getUserReviews: (
    userId: string,
    pageIndex?: number,
    pageSize?: number,
  ) => Promise<PaginatedResponse<UserReviewDto>>;
}
