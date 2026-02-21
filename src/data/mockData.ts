export interface Place {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  district: string;
  description: string;
  whyRecommend: string;
  priceLevel: 1 | 2 | 3;
  tags: string[];
  isSaved?: boolean;
  lat: number;
  lng: number;
  isOpen?: boolean;
  openUntil?: string;
  matchScore?: number; // AI recommendation match percentage
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
  emoji: string;
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
    emoji: "😌",
    description: "Relaxed cafés & parks",
  },
  {
    id: "adventure",
    label: "Adventure",
    emoji: "🔥",
    description: "Exciting activities",
  },
  {
    id: "romantic",
    label: "Date Night",
    emoji: "💕",
    description: "Romantic spots",
  },
  {
    id: "social",
    label: "Squad Goals",
    emoji: "🎉",
    description: "Fun with friends",
  },
  { id: "explore", label: "Explore", emoji: "🧭", description: "Hidden gems" },
  {
    id: "foodie",
    label: "Foodie Run",
    emoji: "🤤",
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
  { id: "felucca", label: "Felucca Rides", emoji: "⛵" },
  { id: "street-food", label: "Street Food", emoji: "🥙" },
  { id: "art-galleries", label: "Art Galleries", emoji: "🎨" },
  { id: "coworking", label: "Co-working", emoji: "💻" },
  { id: "nightlife", label: "Nightlife", emoji: "🌙" },
  { id: "historical", label: "Historical Sites", emoji: "🏛️" },
  { id: "cafes", label: "Cafés & Coffee", emoji: "☕" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "parks", label: "Parks & Nature", emoji: "🌿" },
  { id: "fitness", label: "Fitness & Wellness", emoji: "🧘" },
  { id: "live-music", label: "Live Music", emoji: "🎵" },
  { id: "rooftops", label: "Rooftop Lounges", emoji: "🏙️" },
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
    rating: 4.8,
    reviewCount: 342,
    distance: "2.3 km",
    district: "Zamalek",
    description:
      "Traditional sailboat ride along the Nile with stunning sunset views of Cairo's skyline.",
    whyRecommend:
      "Based on your love for outdoor activities and the Nile. Sunsets here are unmatched — a quintessential Cairo experience.",
    priceLevel: 2,
    tags: ["Outdoor", "Romantic", "Scenic"],
    lat: 30.0561,
    lng: 31.2243,
    isOpen: true,
    openUntil: "10:00 PM",
    matchScore: 97,
  },
  {
    id: "2",
    name: "Zooba — Egyptian Street Food",
    category: "Food & Drink",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 1205,
    distance: "1.1 km",
    district: "Zamalek",
    description:
      "Modern twist on classic Egyptian street food. Famous for their foul, falafel, and hawawshi.",
    whyRecommend:
      "You love street food — Zooba elevates local flavors with a modern, clean dining experience.",
    priceLevel: 1,
    tags: ["Street Food", "Casual", "Local"],
    lat: 30.0609,
    lng: 31.2194,
    isOpen: true,
    openUntil: "12:00 AM",
    matchScore: 92,
  },
  {
    id: "3",
    name: "The Townhouse Gallery",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=600&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 189,
    distance: "3.7 km",
    district: "Downtown",
    description:
      "Independent contemporary art space in the heart of Downtown Cairo.",
    whyRecommend:
      "A hidden gem for art lovers. Features rotating exhibitions from Cairo's vibrant contemporary art scene.",
    priceLevel: 1,
    tags: ["Art", "Culture", "Free Entry"],
    lat: 30.0444,
    lng: 31.2357,
    isOpen: true,
    openUntil: "8:00 PM",
    matchScore: 85,
  },
  {
    id: "4",
    name: "The Greek Campus",
    category: "Work & Study",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    rating: 4.4,
    reviewCount: 567,
    distance: "4.2 km",
    district: "Downtown",
    description:
      "Cairo's premier innovation hub and co-working space in a historic campus.",
    whyRecommend:
      "Perfect for remote work. Great community, fast Wi-Fi, and a buzzing startup ecosystem.",
    priceLevel: 2,
    tags: ["Co-working", "Tech", "Community"],
    lat: 30.0392,
    lng: 31.2385,
    isOpen: true,
    openUntil: "11:00 PM",
    matchScore: 78,
  },
  {
    id: "5",
    name: "Khan el-Khalili",
    category: "Shopping",
    image:
      "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=400&fit=crop",
    rating: 4.3,
    reviewCount: 2340,
    distance: "5.1 km",
    district: "Old Cairo",
    description:
      "Historic bazaar dating back to 1382. A labyrinth of shops selling everything from spices to souvenirs.",
    whyRecommend:
      "An unmissable Cairo experience. The atmosphere, history, and energy are unlike anything else.",
    priceLevel: 1,
    tags: ["Historical", "Shopping", "Iconic"],
    lat: 30.0477,
    lng: 31.2627,
    isOpen: false,
    openUntil: "Closed",
    matchScore: 88,
  },
  {
    id: "6",
    name: "Cairo Jazz Club",
    category: "Nightlife",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 890,
    distance: "3.0 km",
    district: "Agouza",
    description:
      "Legendary live music venue featuring jazz, electronic, and world music.",
    whyRecommend:
      "Cairo's best live music venue. If you love good music and a vibrant crowd, this is your spot.",
    priceLevel: 2,
    tags: ["Nightlife", "Live Music", "Iconic"],
    lat: 30.0565,
    lng: 31.2045,
    isOpen: true,
    openUntil: "3:00 AM",
    matchScore: 94,
  },
  {
    id: "7",
    name: "Al-Azhar Park",
    category: "Parks",
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 1560,
    distance: "4.8 km",
    district: "Old Cairo",
    description:
      "A 30-hectare park offering panoramic views of the Cairo skyline and historic mosques.",
    whyRecommend:
      "A green oasis in the city. Perfect for a peaceful walk, picnic, or catching the sunset over Old Cairo.",
    priceLevel: 1,
    tags: ["Parks", "Scenic", "Family-friendly"],
    lat: 30.0398,
    lng: 31.2628,
    isOpen: true,
    openUntil: "10:00 PM",
    matchScore: 81,
  },
  {
    id: "8",
    name: "Crimson Bar & Grill",
    category: "Food & Drink",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 430,
    distance: "2.8 km",
    district: "Zamalek",
    description:
      "Upscale rooftop dining with Nile views and a world-class cocktail menu.",
    whyRecommend:
      "Your interest in rooftop lounges makes this a perfect match. Stunning views and impeccable service.",
    priceLevel: 3,
    tags: ["Rooftop", "Fine Dining", "Nile View", "Late Night"],
    lat: 30.062,
    lng: 31.22,
    isOpen: true,
    openUntil: "1:00 AM",
    matchScore: 91,
  },
];
