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
}

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
    tags: ["Rooftop", "Fine Dining", "Nile View"],
    lat: 30.062,
    lng: 31.22,
  },
];
