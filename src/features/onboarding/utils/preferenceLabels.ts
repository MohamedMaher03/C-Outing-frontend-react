import type { District } from "@/mocks/mockData";
import { POPULAR_DISTRICTS } from "@/mocks/mockData";
import {
  buildDistrictLookup,
  resolveDistrictRecord,
} from "./districtBrowse";

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
) => string;

export interface PreferenceLabelResolvers {
  interest: (interestId: string, fallback: string) => string;
  district: (district: District) => string;
  districtByName: (districtName: string) => string;
  activity: (activityId: string, fallback: string) => string;
  companion: (companionId: string, fallback: string) => string;
  budget: (value: string) => string;
  budgetRange: (value: string) => string;
}

const slugifyDistrictName = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, "-");

export const createPreferenceLabelResolvers = (
  t: TranslateFn,
  districts: readonly District[] = POPULAR_DISTRICTS,
): PreferenceLabelResolvers => {
  const districtLookup = buildDistrictLookup(districts);

  const resolveDistrict = (district: District): string =>
    t(
      district.nameKey ?? `onboarding.district.${slugifyDistrictName(district.name)}`,
      undefined,
      district.name,
    );

  return {
    interest: (interestId, fallback) =>
      t(`onboarding.interest.${interestId}`, undefined, fallback),
    district: resolveDistrict,
    districtByName: (districtName) =>
      resolveDistrict(resolveDistrictRecord(districtLookup, districtName)),
    activity: (activityId, fallback) =>
      t(`onboarding.activity.${activityId}`, undefined, fallback),
    companion: (companionId, fallback) =>
      t(`onboarding.companion.${companionId}`, undefined, fallback),
    budget: (value) => t(`budget.${value}`, undefined, value),
    budgetRange: (value) => t(`budget.range.${value}`, undefined, ""),
  };
};

export const joinLocalizedLabels = (
  ids: readonly string[],
  resolveLabel: (id: string) => string,
): string => ids.map(resolveLabel).join(", ");
