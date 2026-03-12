export interface Place {
  // Core venue metadata (scraped schema)
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;

  // Ratings & reviews
  rating: number; // rating_stars
  reviewCount: number; // rating_count (abbreviated display)
  totalReviews?: number; // total_reviews (full count)

  // Description & media
  description: string;
  image: string; // primary display image

  // Contact & links
  phone?: string;
  website?: string;
  menuUrl?: string;
  bookingUrl?: string;

  // Pricing
  priceRange?: string; // e.g., "50–200 EGP"
  priceLevel?:
    | "price_cheapest"
    | "cheap"
    | "mid_range"
    | "expensive"
    | "luxury";

  // Hours & open status
  hours?: string; // e.g., "Daily 9:00 AM – 11:00 PM"
  isOpen?: boolean; // derived for UI filter support

  // Feature values — UI-friendly (derived from GNN features)
  atmosphereTags?: string[]; // from atmosphere feature
  socialBadges?: Array<
    "Good for Solo" | "Good for Couples" | "Good for Groups"
  >;
  hasWifi?: boolean;
  hasToilet?: boolean;
  seatingType?: Array<"indoor" | "outdoor">;
  parkingAvailable?: boolean;
  accessibilityScore?: number; // 0–1; shown as badge if >= 0.7

  // Menu summary
  menuImagesCount?: number;
  menuImagesUrls?: string[];

  // App state
  isSaved?: boolean;
  matchScore?: number; // AI recommendation match %
}

export interface Category {
  id: string;
  label: string;
  icon: string; // lucide icon name
  count: number;
  color: string; // tailwind bg class
}

export interface MoodOption {
  id: string;
  label: string;
  icon: string; // lucide icon name
  description: string;
}

export interface TrendingTag {
  id: string;
  label: string;
  searchCount: number;
}

export const CATEGORIES: Category[] = [
  {
    id: "food",
    label: "Food & Drink",
    icon: "UtensilsCrossed",
    count: 124,
    color: "bg-orange-100",
  },
  {
    id: "nightlife",
    label: "Nightlife",
    icon: "Moon",
    count: 56,
    color: "bg-purple-100",
  },
  {
    id: "culture",
    label: "Culture & Art",
    icon: "Palette",
    count: 43,
    color: "bg-pink-100",
  },
  {
    id: "outdoor",
    label: "Outdoors",
    icon: "Trees",
    count: 38,
    color: "bg-green-100",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "ShoppingBag",
    count: 67,
    color: "bg-blue-100",
  },
  {
    id: "wellness",
    label: "Wellness",
    icon: "Heart",
    count: 29,
    color: "bg-teal-100",
  },
  {
    id: "activities",
    label: "Activities",
    icon: "Compass",
    count: 45,
    color: "bg-amber-100",
  },
  {
    id: "coworking",
    label: "Co-working",
    icon: "Laptop",
    count: 31,
    color: "bg-slate-100",
  },
];

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "chill",
    label: "Chill Vibes",
    icon: "Coffee",
    description: "Relaxed cafés & parks",
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: "Mountain",
    description: "Exciting activities",
  },
  {
    id: "romantic",
    label: "Date Night",
    icon: "Heart",
    description: "Romantic spots",
  },
  {
    id: "social",
    label: "Squad Goals",
    icon: "Users",
    description: "Fun with friends",
  },
  {
    id: "explore",
    label: "Explore",
    icon: "Binoculars",
    description: "Hidden gems",
  },
  {
    id: "foodie",
    label: "Foodie Run",
    icon: "UtensilsCrossed",
    description: "Best eats in Cairo",
  },
];

export const TRENDING_TAGS: TrendingTag[] = [
  { id: "nile-view", label: "Nile View", searchCount: 2340 },
  { id: "rooftop", label: "Rooftop", searchCount: 1890 },
  { id: "instagrammable", label: "Instagrammable", searchCount: 1560 },
  { id: "budget-friendly", label: "Budget Friendly", searchCount: 1230 },
  { id: "late-night", label: "Late Night", searchCount: 980 },
  { id: "live-music", label: "Live Music", searchCount: 870 },
  { id: "hidden-gem", label: "Hidden Gem", searchCount: 760 },
  { id: "outdoor-seating", label: "Outdoor Seating", searchCount: 650 },
];

export const POPULAR_DISTRICTS = [
  {
    id: "zamalek",
    name: "Zamalek",
    image:
      "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=300&h=200&fit=crop",
    placeCount: 48,
  },
  {
    id: "downtown",
    name: "Downtown",
    image:
      "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=300&h=200&fit=crop",
    placeCount: 63,
  },
  {
    id: "maadi",
    name: "Maadi",
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300&h=200&fit=crop",
    placeCount: 35,
  },
  {
    id: "heliopolis",
    name: "Heliopolis",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
    placeCount: 41,
  },
  {
    id: "new-cairo",
    name: "New Cairo",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop",
    placeCount: 57,
  },
];

export const INTERESTS = [
  { id: "felucca", label: "Felucca Rides", icon: "Ship" },
  { id: "street-food", label: "Street Food", icon: "Utensils" },
  { id: "art-galleries", label: "Art Galleries", icon: "Palette" },
  { id: "coworking", label: "Co-working", icon: "Laptop" },
  { id: "nightlife", label: "Nightlife", icon: "Moon" },
  { id: "historical", label: "Historical Sites", icon: "Landmark" },
  { id: "cafes", label: "Cafés & Coffee", icon: "Coffee" },
  { id: "shopping", label: "Shopping", icon: "ShoppingBag" },
  { id: "parks", label: "Parks & Nature", icon: "Trees" },
  { id: "fitness", label: "Fitness & Wellness", icon: "Dumbbell" },
  { id: "live-music", label: "Live Music", icon: "Music" },
  { id: "rooftops", label: "Rooftop Lounges", icon: "Building2" },
];

export const DISTRICTS = [
  "Maadi",
  "Downtown",
  "Tagamoa",
  "Zamalek",
  "Heliopolis",
  "Mohandessin",
  "Dokki",
  "Nasr City",
  "Garden City",
  "6th of October",
  "New Cairo",
  "Sheikh Zayed",
];

export const PLACES: Place[] = [
  {
    id: "1",
    name: "Nile Felucca Experience",
    category: "Activities",
    image:
      "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=400&fit=crop",
    latitude: 30.0561,
    longitude: 31.2243,
    address: "Zamalek Corniche, Zamalek, Cairo",
    rating: 4.8,
    reviewCount: 342,
    totalReviews: 342,
    description:
      "Traditional sailboat ride along the Nile with stunning sunset views of Cairo's skyline.",
    priceRange: "100–200 EGP",
    priceLevel: "luxury",
    hours: "Daily 10:00 AM – 10:00 PM",
    isOpen: true,
    atmosphereTags: ["Romantic", "Scenic", "Outdoor"],
    socialBadges: ["Good for Couples", "Good for Solo"],
    hasWifi: false,
    hasToilet: false,
    seatingType: ["outdoor"],
    parkingAvailable: false,
    accessibilityScore: 0.4,
    menuImagesCount: 0,
    matchScore: 97,
  },
  {
    id: "2",
    name: "Zooba — Egyptian Street Food",
    category: "Food & Drink",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
    latitude: 30.0609,
    longitude: 31.2194,
    address: "26 July St, Zamalek, Cairo",
    rating: 4.6,
    reviewCount: 1205,
    totalReviews: 1205,
    description:
      "Modern twist on classic Egyptian street food. Famous for their foul, falafel, and hawawshi.",
    priceRange: "50–120 EGP",
    priceLevel: "cheap",
    hours: "Daily 8:00 AM – 12:00 AM",
    isOpen: true,
    atmosphereTags: ["Casual", "Lively", "Local"],
    socialBadges: ["Good for Solo", "Good for Groups"],
    hasWifi: true,
    hasToilet: true,
    seatingType: ["indoor", "outdoor"],
    parkingAvailable: false,
    accessibilityScore: 0.8,
    menuImagesCount: 12,
    matchScore: 92,
  },
  {
    id: "3",
    name: "The Townhouse Gallery",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=600&h=400&fit=crop",
    latitude: 30.0444,
    longitude: 31.2357,
    address: "10 Nabrawy St, Downtown Cairo",
    rating: 4.5,
    reviewCount: 189,
    totalReviews: 189,
    description:
      "Independent contemporary art space in the heart of Downtown Cairo.",
    priceRange: "Free",
    priceLevel: "cheap",
    hours: "Tue–Sun 10:00 AM – 8:00 PM",
    isOpen: true,
    atmosphereTags: ["Artistic", "Quiet", "Cultural"],
    socialBadges: ["Good for Solo", "Good for Couples"],
    hasWifi: true,
    hasToilet: true,
    seatingType: ["indoor"],
    parkingAvailable: false,
    accessibilityScore: 0.7,
    menuImagesCount: 0,
    matchScore: 85,
  },
  {
    id: "4",
    name: "The Greek Campus",
    category: "Work & Study",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    latitude: 30.0392,
    longitude: 31.2385,
    address: "16 Maamal El Sokkar St, Downtown Cairo",
    rating: 4.4,
    reviewCount: 567,
    totalReviews: 567,
    description:
      "Cairo's premier innovation hub and co-working space in a historic campus.",
    priceRange: "150–400 EGP/day",
    priceLevel: "mid_range",
    hours: "Mon–Fri 8:00 AM – 11:00 PM",
    isOpen: true,
    atmosphereTags: ["Productive", "Trendy", "Community"],
    socialBadges: ["Good for Solo", "Good for Groups"],
    hasWifi: true,
    hasToilet: true,
    seatingType: ["indoor"],
    parkingAvailable: true,
    accessibilityScore: 0.9,
    menuImagesCount: 3,
    matchScore: 78,
  },
  {
    id: "5",
    name: "Khan el-Khalili",
    category: "Shopping",
    image:
      "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=400&fit=crop",
    latitude: 30.0477,
    longitude: 31.2627,
    address: "Khan el-Khalili, Islamic Cairo",
    rating: 4.3,
    reviewCount: 2340,
    totalReviews: 2340,
    description:
      "Historic bazaar dating back to 1382. A labyrinth of shops selling everything from spices to souvenirs.",
    priceRange: "Variable",
    priceLevel: "price_cheapest",
    hours: "Daily 9:00 AM – 11:00 PM",
    isOpen: false,
    atmosphereTags: ["Historic", "Vibrant", "Bustling"],
    socialBadges: ["Good for Groups", "Good for Couples"],
    hasWifi: false,
    hasToilet: true,
    seatingType: ["outdoor"],
    parkingAvailable: false,
    accessibilityScore: 0.3,
    menuImagesCount: 0,
    matchScore: 88,
  },
  {
    id: "6",
    name: "Cairo Jazz Club",
    category: "Nightlife",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
    latitude: 30.0565,
    longitude: 31.2045,
    address: "197 26 July St, Agouza, Cairo",
    rating: 4.7,
    reviewCount: 890,
    totalReviews: 890,
    description:
      "Legendary live music venue featuring jazz, electronic, and world music.",
    priceRange: "200–400 EGP",
    priceLevel: "expensive",
    hours: "Daily 8:00 PM – 3:00 AM",
    isOpen: true,
    atmosphereTags: ["Lively", "Musical", "Nightlife"],
    socialBadges: ["Good for Couples", "Good for Groups"],
    hasWifi: true,
    hasToilet: true,
    seatingType: ["indoor"],
    parkingAvailable: true,
    accessibilityScore: 0.6,
    menuImagesCount: 8,
    matchScore: 94,
  },
  {
    id: "7",
    name: "Al-Azhar Park",
    category: "Parks",
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop",
    latitude: 30.0398,
    longitude: 31.2628,
    address: "Al-Azhar Park, Darb Al-Ahmar, Cairo",
    rating: 4.6,
    reviewCount: 1560,
    totalReviews: 1560,
    description:
      "A 30-hectare park offering panoramic views of the Cairo skyline and historic mosques.",
    priceRange: "10–25 EGP",
    priceLevel: "cheap",
    hours: "Daily 9:00 AM – 10:00 PM",
    isOpen: true,
    atmosphereTags: ["Serene", "Family-friendly", "Scenic"],
    socialBadges: ["Good for Solo", "Good for Couples", "Good for Groups"],
    hasWifi: false,
    hasToilet: true,
    seatingType: ["outdoor"],
    parkingAvailable: true,
    accessibilityScore: 0.8,
    menuImagesCount: 0,
    matchScore: 81,
  },
  {
    id: "8",
    name: "Crimson Bar & Grill",
    category: "Food & Drink",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    latitude: 30.062,
    longitude: 31.22,
    address: "36 Taha Hussein St, Zamalek, Cairo",
    rating: 4.5,
    reviewCount: 430,
    totalReviews: 430,
    description:
      "Upscale rooftop dining with Nile views and a world-class cocktail menu.",
    priceRange: "400–800 EGP",
    priceLevel: "luxury",
    hours: "Daily 1:00 PM – 1:00 AM",
    isOpen: true,
    atmosphereTags: ["Romantic", "Upscale", "Nile View"],
    socialBadges: ["Good for Couples", "Good for Groups"],
    hasWifi: true,
    hasToilet: true,
    seatingType: ["indoor", "outdoor"],
    parkingAvailable: true,
    accessibilityScore: 0.9,
    menuImagesCount: 20,
    matchScore: 91,
  },
];
