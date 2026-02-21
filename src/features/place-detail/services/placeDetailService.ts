/**
 * Place Detail Service
 * Handles all API calls related to place details, reviews, and interactions
 */

// import { apiClient } from "./client"; // TODO: Uncomment when backend is ready
import type { Place } from "@/mocks/mockData";
import { PLACES } from "@/mocks/mockData";

// ============ Types ============
export interface PlaceDetail extends Place {
  openingHours?: {
    open: string;
    close: string;
  };
  phoneNumber?: string;
  website?: string;
  reviews?: Review[];
  similarPlaces?: Place[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface SocialMediaReview {
  id: string;
  platform: "instagram" | "twitter" | "facebook" | "tiktok" | "google";
  author: string;
  authorAvatar?: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  date: Date;
  likes?: number;
  url?: string;
}

export interface ReviewSummary {
  overallSentiment: "positive" | "neutral" | "negative";
  averageRating: number;
  totalReviews: number;
  summary: string;
  highlights: string[];
  commonTopics: {
    topic: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
  }[];
}

export interface RecordInteractionRequest {
  placeId: string;
  actionType: "Click" | "ViewDetails" | "Rate" | "Favorite" | "Share";
  ratingValue?: number;
  comment?: string;
  sessionId: string;
  positionInList?: number;
}

// ============ Mock Data ============

const MOCK_REVIEWS: Record<string, Review[]> = {
  "1": [
    {
      id: "r1",
      userId: "u1",
      userName: "Ahmed M.",
      rating: 5,
      comment:
        "Absolutely magical experience! The sunset from the felucca was breathtaking. Highly recommend for couples.",
      date: new Date("2026-01-15"),
    },
    {
      id: "r2",
      userId: "u2",
      userName: "Sara K.",
      rating: 4,
      comment:
        "Great experience overall. The captain was very friendly and knowledgeable about Cairo's history.",
      date: new Date("2026-01-10"),
    },
    {
      id: "r3",
      userId: "u3",
      userName: "Mohamed A.",
      rating: 5,
      comment:
        "Best way to see Cairo! We went at golden hour and the photos were incredible.",
      date: new Date("2025-12-28"),
    },
    {
      id: "r4",
      userId: "u4",
      userName: "Nour E.",
      rating: 4,
      comment: "Lovely ride, very peaceful. A bit crowded on weekends though.",
      date: new Date("2025-12-20"),
    },
  ],
  "2": [
    {
      id: "r5",
      userId: "u1",
      userName: "Youssef H.",
      rating: 5,
      comment:
        "Best foul and falafel in Cairo! Modern take on street food done right.",
      date: new Date("2026-02-01"),
    },
    {
      id: "r6",
      userId: "u5",
      userName: "Layla S.",
      rating: 4,
      comment:
        "Love the concept. Clean, fresh, and authentic Egyptian flavors.",
      date: new Date("2026-01-25"),
    },
    {
      id: "r7",
      userId: "u6",
      userName: "Omar T.",
      rating: 5,
      comment:
        "Their hawawshi is incredible! Great prices for the quality you get.",
      date: new Date("2026-01-18"),
    },
  ],
};

const MOCK_SOCIAL_REVIEWS: Record<string, SocialMediaReview[]> = {
  "1": [
    {
      id: "sr1",
      platform: "instagram",
      author: "@cairo_adventures",
      content:
        "The Nile felucca ride is a MUST when visiting Cairo! The views are unreal 🌅✨ #CairoLife #NileViews",
      sentiment: "positive",
      date: new Date("2026-02-10"),
      likes: 234,
    },
    {
      id: "sr2",
      platform: "twitter",
      author: "@travel_egypt",
      content:
        "Just had the most peaceful evening on a felucca. Cairo looks so different from the water. Totally worth it!",
      sentiment: "positive",
      date: new Date("2026-02-05"),
      likes: 89,
    },
    {
      id: "sr3",
      platform: "google",
      author: "Tourist Review",
      content:
        "Nice experience but could be better organized. Had to wait 30 minutes for the ride to start.",
      sentiment: "neutral",
      date: new Date("2026-01-28"),
      likes: 12,
    },
    {
      id: "sr4",
      platform: "tiktok",
      author: "@nile_explorer",
      content:
        "POV: You're watching the sunset from a felucca in Cairo 🎶 This is what dreams are made of!",
      sentiment: "positive",
      date: new Date("2026-01-20"),
      likes: 1520,
    },
    {
      id: "sr5",
      platform: "facebook",
      author: "Cairo Explorers Group",
      content:
        "Highly recommend the felucca experience from Zamalek dock. Best prices and most scenic route.",
      sentiment: "positive",
      date: new Date("2026-01-15"),
      likes: 67,
    },
  ],
  "2": [
    {
      id: "sr6",
      platform: "instagram",
      author: "@foodie_cairo",
      content:
        "Zooba never disappoints! Their ta3meya sandwich is chef's kiss 🤌 #ZoobaEgypt #CairoEats",
      sentiment: "positive",
      date: new Date("2026-02-08"),
      likes: 456,
    },
    {
      id: "sr7",
      platform: "twitter",
      author: "@eat_cairo",
      content:
        "Zooba Zamalek branch has the best atmosphere. Great for a quick Egyptian breakfast.",
      sentiment: "positive",
      date: new Date("2026-02-02"),
      likes: 124,
    },
    {
      id: "sr8",
      platform: "google",
      author: "Food Critic",
      content:
        "Authentic Egyptian street food elevated to a whole new level. Clean, modern, and delicious.",
      sentiment: "positive",
      date: new Date("2026-01-22"),
      likes: 45,
    },
  ],
};

const MOCK_REVIEW_SUMMARIES: Record<string, ReviewSummary> = {
  "1": {
    overallSentiment: "positive",
    averageRating: 4.7,
    totalReviews: 342,
    summary:
      "The Nile Felucca Experience is overwhelmingly praised by visitors. Most reviewers highlight the stunning sunset views and the peaceful atmosphere on the water. The experience is particularly popular among couples and photographers. Some reviewers note occasional wait times during peak hours, but the overall consensus is that it's an unmissable Cairo experience.",
    highlights: [
      "Stunning sunset and golden hour views",
      "Friendly and knowledgeable boat captains",
      "Perfect for romantic outings and photography",
      "Affordable pricing for the experience offered",
    ],
    commonTopics: [
      { topic: "Sunset Views", count: 187, sentiment: "positive" },
      { topic: "Romantic Atmosphere", count: 134, sentiment: "positive" },
      { topic: "Wait Times", count: 45, sentiment: "negative" },
      { topic: "Friendly Staff", count: 98, sentiment: "positive" },
      { topic: "Photography", count: 76, sentiment: "positive" },
    ],
  },
  "2": {
    overallSentiment: "positive",
    averageRating: 4.6,
    totalReviews: 1205,
    summary:
      "Zooba is widely celebrated as Cairo's best modern take on Egyptian street food. Reviewers consistently praise the fresh ingredients, authentic flavors, and clean dining environment. The foul, falafel, and hawawshi are the most mentioned dishes. It's a favorite among locals and tourists alike for quick, affordable, and delicious Egyptian cuisine.",
    highlights: [
      "Fresh, authentic Egyptian street food",
      "Modern and clean dining atmosphere",
      "Excellent foul, falafel, and hawawshi",
      "Great value for money",
    ],
    commonTopics: [
      { topic: "Food Quality", count: 567, sentiment: "positive" },
      { topic: "Authentic Flavors", count: 432, sentiment: "positive" },
      { topic: "Cleanliness", count: 234, sentiment: "positive" },
      { topic: "Wait Times", count: 89, sentiment: "neutral" },
      { topic: "Pricing", count: 156, sentiment: "positive" },
    ],
  },
};

// Default mock data for places without specific data
const DEFAULT_REVIEWS: Review[] = [
  {
    id: "dr1",
    userId: "u10",
    userName: "Guest User",
    rating: 4,
    comment: "Great place to visit! Had a wonderful time here.",
    date: new Date("2026-01-05"),
  },
  {
    id: "dr2",
    userId: "u11",
    userName: "Cairo Local",
    rating: 5,
    comment: "One of my favorite spots in the city. Never gets old!",
    date: new Date("2025-12-15"),
  },
];

const DEFAULT_SOCIAL_REVIEWS: SocialMediaReview[] = [
  {
    id: "dsr1",
    platform: "instagram",
    author: "@cairo_guide",
    content: "Another great spot to add to your Cairo list! 📍✨",
    sentiment: "positive",
    date: new Date("2026-01-12"),
    likes: 78,
  },
  {
    id: "dsr2",
    platform: "google",
    author: "Visitor",
    content: "Worth visiting if you're in the area. Good experience overall.",
    sentiment: "positive",
    date: new Date("2025-12-30"),
    likes: 23,
  },
];

const DEFAULT_REVIEW_SUMMARY: ReviewSummary = {
  overallSentiment: "positive",
  averageRating: 4.4,
  totalReviews: 150,
  summary:
    "This place receives generally positive reviews from visitors. Most people enjoy the atmosphere and recommend it as a worthwhile destination in Cairo.",
  highlights: [
    "Enjoyable atmosphere",
    "Good location and accessibility",
    "Positive overall experience",
  ],
  commonTopics: [
    { topic: "Atmosphere", count: 67, sentiment: "positive" },
    { topic: "Location", count: 45, sentiment: "positive" },
    { topic: "Value", count: 38, sentiment: "positive" },
  ],
};

// ============ Service Functions ============

/**
 * Fetch place details by ID
 * TODO: Replace with real API call when backend is ready
 */
export const getPlaceById = async (placeId: string): Promise<PlaceDetail> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const place = PLACES.find((p) => p.id === placeId);
  if (!place) {
    throw new Error("Place not found");
  }

  // Return place with additional details
  return Promise.resolve({
    ...place,
    openingHours: {
      open: "09:00 AM",
      close: "11:00 PM",
    },
  });

  // TODO: Uncomment when backend is ready
  // return apiClient.get<PlaceDetail>(`/places/${placeId}`);
};

/**
 * Fetch user reviews for a place (from the website)
 * TODO: Replace with real API call when backend is ready
 */
export const getPlaceReviews = async (placeId: string): Promise<Review[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return Promise.resolve(MOCK_REVIEWS[placeId] || DEFAULT_REVIEWS);

  // TODO: Uncomment when backend is ready
  // return apiClient.get<Review[]>(`/places/${placeId}/reviews`);
};

/**
 * Fetch social media reviews (from scraping) for a place
 * TODO: Replace with real API call when backend is ready
 */
export const getSocialMediaReviews = async (
  placeId: string,
): Promise<SocialMediaReview[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return Promise.resolve(
    MOCK_SOCIAL_REVIEWS[placeId] || DEFAULT_SOCIAL_REVIEWS,
  );

  // TODO: Uncomment when backend is ready
  // return apiClient.get<SocialMediaReview[]>(`/places/${placeId}/social-reviews`);
};

/**
 * Fetch NLP-generated review summary for a place
 * TODO: Replace with real API call when backend is ready
 */
export const getReviewSummary = async (
  placeId: string,
): Promise<ReviewSummary> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return Promise.resolve(
    MOCK_REVIEW_SUMMARIES[placeId] || DEFAULT_REVIEW_SUMMARY,
  );

  // TODO: Uncomment when backend is ready
  // return apiClient.get<ReviewSummary>(`/places/${placeId}/review-summary`);
};

/**
 * Record user interaction with a place
 * TODO: Replace with real API call when backend is ready
 */
export const recordInteraction = async (
  data: RecordInteractionRequest,
): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("[Mock] Interaction recorded:", data);
  return Promise.resolve();

  // TODO: Uncomment when backend is ready
  // await apiClient.post("/interactions", data);
};

/**
 * Get similar places based on current place
 * TODO: Replace with real API call when backend is ready
 */
export const getSimilarPlaces = async (placeId: string): Promise<Place[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return random places as similar
  const otherPlaces = PLACES.filter((p) => p.id !== placeId);
  return Promise.resolve(otherPlaces.slice(0, 3));

  // TODO: Uncomment when backend is ready
  // return apiClient.get<Place[]>(`/places/${placeId}/similar`);
};

/**
 * Submit a review for a place
 * TODO: Replace with real API call when backend is ready
 */
export const submitReview = async (
  placeId: string,
  rating: number,
  comment: string,
): Promise<Review> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockReview: Review = {
    id: `review_${Date.now()}`,
    userId: "user_1",
    userName: "Current User",
    rating,
    comment,
    date: new Date(),
  };

  // Add to mock data
  if (!MOCK_REVIEWS[placeId]) {
    MOCK_REVIEWS[placeId] = [];
  }
  MOCK_REVIEWS[placeId].unshift(mockReview);

  console.log("[Mock] Review submitted for place:", placeId, mockReview);
  return Promise.resolve(mockReview);

  // TODO: Uncomment when backend is ready
  // return apiClient.post<Review>(`/places/${placeId}/reviews`, {
  //   rating,
  //   comment,
  // });
};
