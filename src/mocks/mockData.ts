import type { CanonicalPriceLevel } from "@/utils/priceLevels";

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
  priceLevel?: CanonicalPriceLevel;

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
  matchScore?: number;
}

export interface Category {
  id: string;
  label: string;
  nameKey?: string;
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
    id: "arts",
    label: "Arts & Culture",
    nameKey: "categories.arts-culture",
  },
  { id: "Bakery", label: "Bakery", nameKey: "categories.bakery" },
  { id: "Bar", label: "Bar", nameKey: "categories.bar" },
  { id: "Cafe", label: "Cafe", nameKey: "categories.cafe" },
  { id: "Cinema", label: "Cinema", nameKey: "categories.cinema" },
  {
    id: "Community",
    label: "Community & Public Spaces",
    nameKey: "categories.community",
  },
  { id: "Dessert", label: "Dessert", nameKey: "categories.dessert" },
  // {
  //   id: "Entertainment",
  //   label: "Entertainment",
  //   nameKey: "categories.entertainment",
  // },
  { id: "Gaming", label: "Gaming", nameKey: "categories.gaming" },
  { id: "Nightlife", label: "Nightlife", nameKey: "categories.nightlife" },
  { id: "Office", label: "Office", nameKey: "categories.office" },
  { id: "Outdoors", label: "Outdoors", nameKey: "categories.outdoors" },
  { id: "Recreation", label: "Recreation", nameKey: "categories.recreation" },
  { id: "Restaurant", label: "Restaurant", nameKey: "categories.restaurant" },
  { id: "Retail", label: "Retail", nameKey: "categories.retail" },
  { id: "Shopping", label: "Shopping", nameKey: "categories.shopping" },
  // { id: "Theater", label: "Theater", nameKey: "categories.theater" },
  { id: "Workspace", label: "Workspace", nameKey: "categories.workspace" },
];

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "chill_vibes",
    label: "Chill Vibes",
    icon: "Coffee",
    description: "Relaxed cafés & parks",
  },
  {
    id: "date_night",
    label: "Date Night",
    icon: "Heart",
    description: "Romantic spots",
  },
  {
    id: "squad_goals",
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
    id: "foodie_run",
    label: "Foodie Run",
    icon: "UtensilsCrossed",
    description: "Best eats in Cairo",
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: "Mountain",
    description: "Exciting activities",
  },
  {
    id: "night_owl",
    label: "Night Owl",
    icon: "Moon",
    description: "Late-night hangouts",
  },
  {
    id: "culture_trip",
    label: "Culture Trip",
    icon: "Palette",
    description: "Arts & heritage spots",
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

export interface District {
  id: string;
  name: string;
  nameKey?: string; // translation key for name
}

export const POPULAR_DISTRICTS: District[] = [
  // Most popular districts kept at the top
  { id: "zamalek", name: "Zamalek", nameKey: "onboarding.district.zamalek" },
  { id: "maadi", name: "Maadi", nameKey: "onboarding.district.maadi" },
  { id: "downtown", name: "Downtown", nameKey: "onboarding.district.downtown" },
  {
    id: "heliopolis",
    name: "Heliopolis",
    nameKey: "onboarding.district.heliopolis",
  },
  {
    id: "5th-settlement",
    name: "5th Settlement",
    nameKey: "onboarding.district.5th-settlement",
  },
  {
    id: "nasr-city",
    name: "Nasr City",
    nameKey: "onboarding.district.nasr-city",
  },
  { id: "dokki", name: "Dokki", nameKey: "onboarding.district.dokki" },
  { id: "agouza", name: "Agouza", nameKey: "onboarding.district.agouza" },
  {
    id: "old-cairo",
    name: "Old Cairo",
    nameKey: "onboarding.district.old-cairo",
  },
  {
    id: "qasr-el-nil",
    name: "Qasr El Nil",
    nameKey: "onboarding.district.qasr-el-nil",
  },
  {
    id: "mokattam",
    name: "El Mokattam",
    nameKey: "onboarding.district.mokattam",
  },
  {
    id: "sayeda-zeinab",
    name: "El Sayeda Zeinab",
    nameKey: "onboarding.district.sayeda-zeinab",
  },

  { id: "abdeen", name: "Abdeen", nameKey: "onboarding.district.abdeen" },
  {
    id: "ain-shams",
    name: "Ain Shams",
    nameKey: "onboarding.district.ain-shams",
  },
  {
    id: "azbakeya",
    name: "Al Azbakeya",
    nameKey: "onboarding.district.azbakeya",
  },
  { id: "giza", name: "Al Giza", nameKey: "onboarding.district.giza" },
  {
    id: "al-salam-first",
    name: "Al Salam First",
    nameKey: "onboarding.district.al-salam-first",
  },
  { id: "warak", name: "Al Warak", nameKey: "onboarding.district.warak" },
  {
    id: "darb-el-ahmar",
    name: "Al-Darb Al-Ahmar",
    nameKey: "onboarding.district.darb-el-ahmar",
  },
  {
    id: "bab-el-sharia",
    name: "Bab El Sharia",
    nameKey: "onboarding.district.bab-el-sharia",
  },
  { id: "boulaq", name: "Bulaq", nameKey: "onboarding.district.boulaq" },
  { id: "daher", name: "Daher", nameKey: "onboarding.district.daher" },
  { id: "basatin", name: "El Basatin", nameKey: "onboarding.district.basatin" },
  {
    id: "gamaliya",
    name: "El Gamaliya",
    nameKey: "onboarding.district.el-gamaliya",
  },
  {
    id: "el-khalifa",
    name: "El Khalifa",
    nameKey: "onboarding.district.el-khalifa",
  },
  { id: "el-marg", name: "El Marg", nameKey: "onboarding.district.el-marg" },
  { id: "nozha", name: "El Nozha", nameKey: "onboarding.district.nozha" },
  {
    id: "omraniya",
    name: "El Omraniya",
    nameKey: "onboarding.district.omraniya",
  },
  { id: "el-sahel", name: "El Sahel", nameKey: "onboarding.district.el-sahel" },
  {
    id: "el-sharabia",
    name: "El Sharabia",
    nameKey: "onboarding.district.el-sharabia",
  },
  { id: "talbia", name: "El Talbia", nameKey: "onboarding.district.talbia" },
  { id: "weili", name: "El Weili", nameKey: "onboarding.district.weili" },
  {
    id: "zawya-el-hamra",
    name: "El Zawya El Hamra",
    nameKey: "onboarding.district.zawya-el-hamra",
  },
  {
    id: "hadayek-el-qobbah",
    name: "Hada'iq El Qobbah",
    nameKey: "onboarding.district.hadayek-el-qobbah",
  },
  { id: "imaba", name: "Imbaba", nameKey: "onboarding.district.imaba" },
  {
    id: "manshiyat-naser",
    name: "Manshiyat Naser",
    nameKey: "onboarding.district.manshiyat-naser",
  },
  {
    id: "new-cairo-3",
    name: "New Cairo 3",
    nameKey: "onboarding.district.new-cairo-3",
  },
  {
    id: "rod-el-farag",
    name: "Rod El Farag",
    nameKey: "onboarding.district.rod-el-farag",
  },
  {
    id: "second-new-cairo",
    name: "Second New Cairo",
    nameKey: "onboarding.district.second-new-cairo",
  },
  { id: "shubra", name: "Shubra", nameKey: "onboarding.district.shubra" },
  {
    id: "shubra-el-kheima-1",
    name: "Shubra El Kheima 1",
    nameKey: "onboarding.district.shubra-el-kheima-1",
  },
  {
    id: "shubra-el-kheima-2",
    name: "Shubra El Kheima 2",
    nameKey: "onboarding.district.shubra-el-kheima-2",
  },
  { id: "tura", name: "Tura", nameKey: "onboarding.district.tura" },
  { id: "zeitoun", name: "Zeitoun", nameKey: "onboarding.district.zeitoun" },
  {
    id: "new-cairo",
    name: "New Cairo",
    nameKey: "onboarding.district.new-cairo",
  },
  {
    id: "6th-of-october",
    name: "6th of October",
    nameKey: "onboarding.district.6th-of-october",
  },
  {
    id: "sheikh-zayed",
    name: "Sheikh Zayed",
    nameKey: "onboarding.district.sheikh-zayed",
  },
  { id: "obour", name: "Obour", nameKey: "onboarding.district.obour" },
  {
    id: "el-shorouk",
    name: "El Shorouk",
    nameKey: "onboarding.district.el-shorouk",
  },
  { id: "helwan", name: "Helwan", nameKey: "onboarding.district.helwan" },
  { id: "al-salam", name: "Al Salam", nameKey: "onboarding.district.al-salam" },
  { id: "badr", name: "Badr", nameKey: "onboarding.district.badr" },
  { id: "kerdasa", name: "Kerdasa", nameKey: "onboarding.district.kerdasa" },
  {
    id: "boulaq-al-dakrour",
    name: "Boulaq Al Dakrour",
    nameKey: "onboarding.district.boulaq-al-dakrour",
  },
  {
    id: "15-may-city",
    name: "15 May City",
    nameKey: "onboarding.district.15-may-city",
  },
  { id: "ossim", name: "Ossim", nameKey: "onboarding.district.ossim" },
  {
    id: "el-matareya",
    name: "El Matareya",
    nameKey: "onboarding.district.el-matareya",
  },
  {
    id: "10th-of-ramadan",
    name: "10th of Ramadan",
    nameKey: "onboarding.district.10th-of-ramadan",
  },
  {
    id: "october-gardens",
    name: "October Gardens",
    nameKey: "onboarding.district.october-gardens",
  },
  {
    id: "hadayek-el-ahram",
    name: "Hadayek El Ahram",
    nameKey: "onboarding.district.hadayek-el-ahram",
  },
  {
    id: "garden-city",
    name: "Garden City",
    nameKey: "onboarding.district.garden-city",
  },
  {
    id: "al-manial",
    name: "Al Manial",
    nameKey: "onboarding.district.al-manial",
  },
  { id: "al-rehab", name: "Al Rehab", nameKey: "onboarding.district.al-rehab" },
  {
    id: "3rd-settlement",
    name: "3rd Settlement",
    nameKey: "onboarding.district.3rd-settlement",
  },
  { id: "abaseya", name: "Abaseya", nameKey: "onboarding.district.abaseya" },

  { id: "al-haram", name: "Al Haram", nameKey: "onboarding.district.al-haram" },
  { id: "faisal", name: "Faisal", nameKey: "onboarding.district.faisal" },
  {
    id: "dar-el-salam",
    name: "Dar El Salam",
    nameKey: "onboarding.district.dar-el-salam",
  },
  {
    id: "badrshein",
    name: "Badrshein",
    nameKey: "onboarding.district.badrshein",
  },
  {
    id: "el-hawamdeya",
    name: "El Hawamdeya",
    nameKey: "onboarding.district.el-hawamdeya",
  },
  {
    id: "el-masara",
    name: "El Masara",
    nameKey: "onboarding.district.el-masara",
  },
  {
    id: "el-tebbin",
    name: "El Tebbin",
    nameKey: "onboarding.district.el-tebbin",
  },
  {
    id: "al-khankah",
    name: "Al Khankah",
    nameKey: "onboarding.district.al-khankah",
  },
  { id: "khusus", name: "Khusus", nameKey: "onboarding.district.khusus" },
  { id: "qalyub", name: "Qalyub", nameKey: "onboarding.district.qalyub" },
  {
    id: "el-qanater",
    name: "El Qanater",
    nameKey: "onboarding.district.el-qanater",
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
  // { id: "rooftops", label: "Rooftop Lounges", icon: "Building2" },
];

export const DISTRICTS = POPULAR_DISTRICTS.map((district) => district.name);

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
    priceLevel: "midrange",
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
    priceLevel: "cheapest",
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
