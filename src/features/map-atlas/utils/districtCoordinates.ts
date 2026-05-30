import type { District } from "@/mocks/mockData";
import { calculateDistanceKm } from "@/features/home/utils/distance";

export type DistrictCoordinates = {
  latitude: number;
  longitude: number;
};

export const DISTRICT_COORDINATES: Record<string, DistrictCoordinates> = {
  // Most popular districts & independent keys
  zamalek: { latitude: 30.060942, longitude: 31.219709 },
  maadi: { latitude: 29.959514, longitude: 31.258935 },
  downtown: { latitude: 30.046714, longitude: 31.234713 },
  heliopolis: { latitude: 30.112315, longitude: 31.343851 },
  "new-cairo": { latitude: 30.037541, longitude: 31.519251 },
  "new-cairo-1": { latitude: 30.0131, longitude: 31.4913 },
  "6th-of-october": { latitude: 29.961107, longitude: 30.929599 },
  "nasr-city": { latitude: 30.051085, longitude: 31.365599 },
  "sheikh-zayed": { latitude: 30.038174, longitude: 30.979353 },
  dokki: { latitude: 30.038266, longitude: 31.211435 },
  agouza: { latitude: 30.051122, longitude: 31.212553 },
  obour: { latitude: 30.193809, longitude: 31.460161 },
  "el-nozha": { latitude: 30.107355, longitude: 31.388467 },
  "old-cairo": { latitude: 30.00778, longitude: 31.23402 },
  "qasr-el-nil": { latitude: 30.042, longitude: 31.238 },
  mokattam: { latitude: 30.0008, longitude: 31.319849 },
  "sayeda-zeinab": { latitude: 30.032345, longitude: 31.241699 },
  abdeen: { latitude: 30.0428, longitude: 31.2472 },
  "ain-shams": { latitude: 30.125305, longitude: 31.333378 },
  azbakeya: { latitude: 30.0544, longitude: 31.2461 },
  giza: { latitude: 30.005316, longitude: 31.203246 },
  "al-salam": { latitude: 30.171842, longitude: 31.406452 },
  "al-salam-first": { latitude: 30.1286, longitude: 31.2914 },
  warak: { latitude: 30.091263, longitude: 31.212653 },
  badr: { latitude: 30.139167, longitude: 31.731748 },
  kerdasa: { latitude: 30.030116, longitude: 31.112192 },
  "darb-el-ahmar": { latitude: 30.023415, longitude: 31.257733 },
  "bab-el-sharia": { latitude: 30.0556, longitude: 31.2611 },
  boulaq: { latitude: 30.0667, longitude: 31.2333 },
  daher: { latitude: 30.066105, longitude: 31.256914 },
  basatin: { latitude: 29.984416, longitude: 31.246501 },
  gamaliya: { latitude: 30.047395, longitude: 31.27122 },
  "el-khalifa": { latitude: 30.023415, longitude: 31.257733 },
  "el-marg": { latitude: 30.154291, longitude: 31.348445 },
  nozha: { latitude: 30.107355, longitude: 31.388467 },
  omraniya: { latitude: 30.005316, longitude: 31.203246 },
  "el-sahel": { latitude: 30.1056, longitude: 31.2472 },
  "el-sharabia": { latitude: 30.066105, longitude: 31.256914 },
  talbia: { latitude: 30.0333, longitude: 31.2833 },
  weili: { latitude: 30.078164, longitude: 31.282664 },
  "zawya-el-hamra": { latitude: 30.0889, longitude: 31.3056 },
  "hadayek-el-qobbah": { latitude: 30.078164, longitude: 31.282664 },
  imaba: { latitude: 30.091263, longitude: 31.212653 },
  "manshiyat-naser": { latitude: 30.0333, longitude: 31.2833 },
  "new-cairo-3": { latitude: 30.0333, longitude: 31.4833 },
  "rod-el-farag": { latitude: 30.07488, longitude: 31.243321 },
  "second-new-cairo": { latitude: 30.025, longitude: 31.475 },
  shubra: { latitude: 30.07488, longitude: 31.243321 },
  "shubra-el-kheima-1": { latitude: 30.1289, longitude: 31.2444 },
  "shubra-el-kheima-2": { latitude: 30.1333, longitude: 31.25 },
  tura: { latitude: 29.953842, longitude: 31.287389 },
  zeitoun: { latitude: 30.119387, longitude: 31.318419 },
  "el-shorouk": { latitude: 30.16124, longitude: 31.623376 },
  helwan: { latitude: 29.844328, longitude: 31.324677 },
  "boulaq-al-dakrour": { latitude: 30.035674, longitude: 31.190543 },
  "15-may-city": { latitude: 29.85794, longitude: 31.388467 },
  ossim: { latitude: 30.117495, longitude: 31.138334 },
  "el-matareya": { latitude: 30.126681, longitude: 31.305549 },
  "10th-of-ramadan": { latitude: 30.286609, longitude: 31.74272 },
  "october-gardens": { latitude: 29.933308, longitude: 31.043917 },
  "hadayek-el-ahram": { latitude: 29.971151, longitude: 31.101354 },
  "garden-city": { latitude: 30.038058, longitude: 31.232589 },
  "al-manial": { latitude: 30.021361, longitude: 31.226865 },
  "al-rehab": { latitude: 30.064626, longitude: 31.488175 },
  "3rd-settlement": { latitude: 29.980083, longitude: 31.432761 },
  "5th-settlement": { latitude: 30.008487, longitude: 31.428476 },
  abaseya: { latitude: 30.065008, longitude: 31.271445 },

  // Separated 2-in-1 entities with target matching coordinates
  "al-haram": { latitude: 29.9912, longitude: 31.1423 },
  faisal: { latitude: 30.0075, longitude: 31.1578 },
  "dar-el-salam": { latitude: 29.9928, longitude: 31.2372 },
  badrshein: { latitude: 29.8436, longitude: 31.2673 },
  "el-hawamdeya": { latitude: 29.8967, longitude: 31.2644 },
  "el-masara": { latitude: 29.9022, longitude: 31.2947 },
  "el-tebbin": { latitude: 29.7719, longitude: 31.3128 },
  "al-khankah": { latitude: 30.2117, longitude: 31.3683 },
  khusus: { latitude: 30.1633, longitude: 31.3117 },
  qalyub: { latitude: 30.1797, longitude: 31.2053 },
  "el-qanater": { latitude: 30.1936, longitude: 31.1408 },
};

export const getDistrictDistanceKm = (
  districtId: string,
  userLat: number,
  userLng: number,
): number => {
  const coords = DISTRICT_COORDINATES[districtId];
  if (!coords) {
    return Number.POSITIVE_INFINITY;
  }

  return calculateDistanceKm(
    userLat,
    userLng,
    coords.latitude,
    coords.longitude,
  );
};

export const findNearestDistrict = (
  userLat: number,
  userLng: number,
  districts: District[],
): District | null => {
  if (districts.length === 0) {
    return null;
  }

  let nearest = districts[0];
  let minDistance = Number.POSITIVE_INFINITY;

  for (const district of districts) {
    const distance = getDistrictDistanceKm(district.id, userLat, userLng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = district;
    }
  }

  return nearest;
};

export const sortDistrictsByProximity = (
  districts: District[],
  userLat: number,
  userLng: number,
): District[] =>
  [...districts].sort(
    (first, second) =>
      getDistrictDistanceKm(first.id, userLat, userLng) -
      getDistrictDistanceKm(second.id, userLat, userLng),
  );
