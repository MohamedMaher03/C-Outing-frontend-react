import type { Review, SocialMediaReview, ReviewSummary } from "../types";

export const MOCK_REVIEWS: Record<string, Review[]> = {
  "1": [
    {
      id: "r1",
      venueId: "1",
      venueName: "Nile Felucca Experience",
      userId: "u1",
      userName: "Ahmed M.",
      rating: 5,
      comment:
        "Absolutely magical experience! The sunset from the felucca was breathtaking. Highly recommend for couples.",
      createdAt: new Date("2026-01-15").toISOString(),
      updatedAt: new Date("2026-01-15").toISOString(),
    },
    {
      id: "r2",
      venueId: "1",
      venueName: "Nile Felucca Experience",
      userId: "u2",
      userName: "Sara K.",
      rating: 4,
      comment:
        "Great experience overall. The captain was very friendly and knowledgeable about Cairo's history.",
      createdAt: new Date("2026-01-10").toISOString(),
      updatedAt: new Date("2026-01-10").toISOString(),
    },
    {
      id: "r3",
      venueId: "1",
      venueName: "Nile Felucca Experience",
      userId: "u3",
      userName: "Mohamed A.",
      rating: 5,
      comment:
        "Best way to see Cairo! We went at golden hour and the photos were incredible.",
      createdAt: new Date("2025-12-28").toISOString(),
      updatedAt: new Date("2025-12-28").toISOString(),
    },
    {
      id: "r4",
      venueId: "1",
      venueName: "Nile Felucca Experience",
      userId: "u4",
      userName: "Nour E.",
      rating: 4,
      comment: "Lovely ride, very peaceful. A bit crowded on weekends though.",
      createdAt: new Date("2025-12-20").toISOString(),
      updatedAt: new Date("2025-12-20").toISOString(),
    },
  ],
  "2": [
    {
      id: "r5",
      venueId: "2",
      venueName: "Zooba — Egyptian Street Food",
      userId: "u1",
      userName: "Youssef H.",
      rating: 5,
      comment:
        "Best foul and falafel in Cairo! Modern take on street food done right.",
      createdAt: new Date("2026-02-01").toISOString(),
      updatedAt: new Date("2026-02-01").toISOString(),
    },
    {
      id: "r6",
      venueId: "2",
      venueName: "Zooba — Egyptian Street Food",
      userId: "u5",
      userName: "Layla S.",
      rating: 4,
      comment:
        "Love the concept. Clean, fresh, and authentic Egyptian flavors.",
      createdAt: new Date("2026-01-25").toISOString(),
      updatedAt: new Date("2026-01-25").toISOString(),
    },
    {
      id: "r7",
      venueId: "2",
      venueName: "Zooba — Egyptian Street Food",
      userId: "u6",
      userName: "Omar T.",
      rating: 5,
      comment:
        "Their hawawshi is incredible! Great prices for the quality you get.",
      createdAt: new Date("2026-01-18").toISOString(),
      updatedAt: new Date("2026-01-18").toISOString(),
    },
  ],
};

export const MOCK_SOCIAL_REVIEWS: Record<string, SocialMediaReview[]> = {
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

export const MOCK_REVIEW_SUMMARIES: Record<string, ReviewSummary> = {
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

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: "dr1",
    venueId: "default",
    venueName: "Default Venue",
    userId: "u10",
    userName: "Guest User",
    rating: 4,
    comment: "Great place to visit! Had a wonderful time here.",
    createdAt: new Date("2026-01-05").toISOString(),
    updatedAt: new Date("2026-01-05").toISOString(),
  },
  {
    id: "dr2",
    venueId: "default",
    venueName: "Default Venue",
    userId: "u11",
    userName: "Cairo Local",
    rating: 5,
    comment: "One of my favorite spots in the city. Never gets old!",
    createdAt: new Date("2025-12-15").toISOString(),
    updatedAt: new Date("2025-12-15").toISOString(),
  },
];

export const DEFAULT_SOCIAL_REVIEWS: SocialMediaReview[] = [
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

export const DEFAULT_REVIEW_SUMMARY: ReviewSummary = {
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
