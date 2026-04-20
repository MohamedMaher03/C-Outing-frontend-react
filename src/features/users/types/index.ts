export interface PublicUserProfile {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  reviewCount: number;
  joinedDate?: string | Date;
  age?: number;
  role?: number;
  totalInteractions?: number;
  isBanned?: boolean;
  isEmailVerified?: boolean;
}

export interface UserReviewActivity {
  reviewId: string;
  placeId: string;
  placeName: string;
  placeImage?: string;
  placeCategory?: string;
  rating: number;
  comment: string;
  date: string | Date;
  sentimentScore?: number;
  userAvatar?: string;
}

export interface UserStats {
  reviewCount: number;
  placesVisited: number;
}

export * from "./dataSource";
