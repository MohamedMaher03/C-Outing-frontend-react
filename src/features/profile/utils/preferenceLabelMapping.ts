import { INTERESTS, POPULAR_DISTRICTS } from "@/mocks/mockData";
import {
  COMPANION_TYPES,
  FAVORITE_ACTIVITIES,
} from "@/features/onboarding/mocks";
import type { PriceLevel } from "@/features/place-detail";

const buildLabelToIdMap = (
  options: ReadonlyArray<{ id: string; label: string }>,
): Map<string, string> =>
  new Map(options.map((option) => [option.label.toLowerCase(), option.id]));

const buildIdToLabelMap = (
  options: ReadonlyArray<{ id: string; label: string }>,
): Map<string, string> => new Map(options.map((option) => [option.id, option.label]));

export const storedInterestLabelToId = buildLabelToIdMap(INTERESTS);
export const storedActivityLabelToId = buildLabelToIdMap(FAVORITE_ACTIVITIES);
export const storedCompanionLabelToId = buildLabelToIdMap(COMPANION_TYPES);

export const preferenceInterestIdToLabel = buildIdToLabelMap(INTERESTS);
export const preferenceActivityIdToLabel = buildIdToLabelMap(FAVORITE_ACTIVITIES);
export const preferenceCompanionIdToLabel = buildIdToLabelMap(COMPANION_TYPES);

export const storedDistrictLabelToName = POPULAR_DISTRICTS.reduce<Map<string, string>>(
  (districtMap, district) => {
    districtMap.set(district.name.toLowerCase(), district.name);
    if (district.name === "Downtown") {
      districtMap.set("downtown cairo", "Downtown");
    }
    return districtMap;
  },
  new Map(),
);

export const preferenceDistrictNameToLabel = POPULAR_DISTRICTS.reduce<
  Map<string, string>
>((districtMap, district) => {
  districtMap.set(district.name, district.name);
  if (district.name === "Downtown") {
    districtMap.set("Downtown", "Downtown Cairo");
  }
  return districtMap;
}, new Map());

export const storedBudgetToPreferenceLevel: Record<string, PriceLevel> = {
  Economy: "cheapest",
  Value: "cheap",
  Standard: "midrange",
  Premium: "expensive",
  Luxury: "luxury",
};

export const preferenceLevelToStoredBudget: Record<PriceLevel, string> = {
  cheapest: "Economy",
  cheap: "Value",
  midrange: "Standard",
  expensive: "Premium",
  luxury: "Luxury",
};

export const resolveStoredLabelToId = (
  labelMap: Map<string, string>,
  rawValue: string,
): string => labelMap.get(rawValue.trim().toLowerCase()) ?? rawValue.trim();

export const resolvePreferenceIdToLabel = (
  labelMap: Map<string, string>,
  rawValue: string,
): string => labelMap.get(rawValue) ?? rawValue;
