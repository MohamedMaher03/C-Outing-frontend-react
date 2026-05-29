import type { District } from "@/mocks/mockData";
import { calculateDistanceKm } from "@/features/home/utils/distance";

export type DistrictCoordinates = {
  latitude: number;
  longitude: number;
};

export const DISTRICT_COORDINATES: Record<string, DistrictCoordinates> = {
  zamalek: { latitude: 30.0626, longitude: 31.2197 },
  maadi: { latitude: 29.9602, longitude: 31.2569 },
  downtown: { latitude: 30.0444, longitude: 31.2357 },
  heliopolis: { latitude: 30.0875, longitude: 31.324 },
  "new-cairo-1": { latitude: 30.0131, longitude: 31.4913 },
  "nasr-city": { latitude: 30.0511, longitude: 31.3656 },
  dokki: { latitude: 30.038, longitude: 31.209 },
  agouza: { latitude: 30.0567, longitude: 31.2133 },
  "old-cairo": { latitude: 30.0061, longitude: 31.23 },
  "qasr-el-nil": { latitude: 30.042, longitude: 31.238 },
  mokattam: { latitude: 30.0214, longitude: 31.3033 },
  "sayeda-zeinab": { latitude: 30.0278, longitude: 31.2422 },
  abdeen: { latitude: 30.0428, longitude: 31.2472 },
  "ain-shams": { latitude: 30.1289, longitude: 31.3194 },
  azbakeya: { latitude: 30.0544, longitude: 31.2461 },
  giza: { latitude: 30.0131, longitude: 31.2089 },
  "al-salam-first": { latitude: 30.1286, longitude: 31.2914 },
  warak: { latitude: 30.1889, longitude: 31.1978 },
  "darb-el-ahmar": { latitude: 30.0333, longitude: 31.2611 },
  "bab-el-sharia": { latitude: 30.0556, longitude: 31.2611 },
  boulaq: { latitude: 30.0667, longitude: 31.2333 },
  daher: { latitude: 30.0639, longitude: 31.2806 },
  basatin: { latitude: 29.9789, longitude: 31.2667 },
  gamaliya: { latitude: 30.0489, longitude: 31.2611 },
  "el-khalifa": { latitude: 30.0128, longitude: 31.2569 },
  "el-marg": { latitude: 30.15, longitude: 31.35 },
  nozha: { latitude: 30.1167, longitude: 31.35 },
  omraniya: { latitude: 30.1056, longitude: 31.2111 },
  "el-sahel": { latitude: 30.1056, longitude: 31.2472 },
  "el-sharabia": { latitude: 30.075, longitude: 31.2861 },
  talbia: { latitude: 30.0333, longitude: 31.2833 },
  weili: { latitude: 30.0722, longitude: 31.3056 },
  "zawya-el-hamra": { latitude: 30.0889, longitude: 31.3056 },
  "hadayek-el-qobbah": { latitude: 30.0861, longitude: 31.2889 },
  imaba: { latitude: 30.075, longitude: 31.2167 },
  "manshiyat-naser": { latitude: 30.0333, longitude: 31.2833 },
  "new-cairo-3": { latitude: 30.0333, longitude: 31.4833 },
  "rod-el-farag": { latitude: 30.0778, longitude: 31.2444 },
  "second-new-cairo": { latitude: 30.025, longitude: 31.475 },
  shubra: { latitude: 30.1167, longitude: 31.2444 },
  "shubra-el-kheima-1": { latitude: 30.1289, longitude: 31.2444 },
  "shubra-el-kheima-2": { latitude: 30.1333, longitude: 31.25 },
  tura: { latitude: 29.9083, longitude: 31.2833 },
  zeitoun: { latitude: 30.1167, longitude: 31.3167 },
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
