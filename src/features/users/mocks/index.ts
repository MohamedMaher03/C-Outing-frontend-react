/**
 * Users Feature — Mock Data
 * Simulates public user profiles and their review activity.
 * Replace with real API calls when the backend is ready.
 */

import type { PublicUserProfile, UserReviewActivity } from "../types";

export const MOCK_PUBLIC_PROFILES: Record<string, PublicUserProfile> = {
  u1: {
    userId: "u1",
    name: "Ahmed M.",
    bio: "Cairo explorer | Coffee addict | Always looking for the next hidden gem.",
    reviewCount: 12,
    joinedDate: new Date("2024-03-10"),
    isFollowing: false,
  },
  u2: {
    userId: "u2",
    name: "Sara K.",
    bio: "Food blogger & weekend adventurer. Sharing the best spots in Egypt.",
    reviewCount: 8,
    joinedDate: new Date("2024-06-01"),
    isFollowing: true,
  },
  u3: {
    userId: "u3",
    name: "Mohamed A.",
    bio: "Photography enthusiast. I visit places to capture golden-hour moments.",
    reviewCount: 21,
    joinedDate: new Date("2023-11-20"),
    isFollowing: false,
  },
  u4: {
    userId: "u4",
    name: "Nour E.",
    bio: "Discovering Cairo one neighbourhood at a time.",
    reviewCount: 5,
    joinedDate: new Date("2025-01-05"),
    isFollowing: false,
  },
};

export const MOCK_USER_REVIEWS: Record<string, UserReviewActivity[]> = {
  u1: [
    {
      reviewId: "r1",
      placeId: "1",
      placeName: "Nile Felucca Ride",
      placeCategory: "Experience",
      rating: 5,
      comment:
        "Absolutely magical experience! The sunset from the felucca was breathtaking. Highly recommend for couples.",
      date: new Date("2026-01-15"),
    },
    {
      reviewId: "r5b",
      placeId: "2",
      placeName: "Zooba — Egyptian Street Food",
      placeCategory: "Food & Drink",
      rating: 4,
      comment: "Classic Cairo comfort food. Always a reliable stop.",
      date: new Date("2025-12-05"),
    },
  ],
  u2: [
    {
      reviewId: "r2",
      placeId: "1",
      placeName: "Nile Felucca Ride",
      placeCategory: "Experience",
      rating: 4,
      comment:
        "Great experience overall. The captain was very friendly and knowledgeable about Cairo's history.",
      date: new Date("2026-01-10"),
    },
  ],
  u3: [
    {
      reviewId: "r3",
      placeId: "1",
      placeName: "Nile Felucca Ride",
      placeCategory: "Experience",
      rating: 5,
      comment:
        "Best way to see Cairo! We went at golden hour and the photos were incredible.",
      date: new Date("2025-12-28"),
    },
  ],
  u4: [
    {
      reviewId: "r4",
      placeId: "1",
      placeName: "Nile Felucca Ride",
      placeCategory: "Experience",
      rating: 4,
      comment: "Lovely ride, very peaceful. A bit crowded on weekends though.",
      date: new Date("2025-12-20"),
    },
  ],
};
