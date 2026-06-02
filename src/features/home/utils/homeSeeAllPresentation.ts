import type { LucideIcon } from "lucide-react";
import { Flame, Sparkles } from "lucide-react";
import { MOOD_OPTIONS } from "@/mocks/mockData";
import { MOOD_ICON_MAP } from "@/features/home/mocks";
import type { HomeRecommendationCollection } from "@/features/home/types";

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
) => string;

export interface SeeAllCollectionHeader {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string;
}

const STATIC_COLLECTION_REGISTRY: Record<
  Exclude<HomeRecommendationCollection, "mood">,
  {
    titleKey: string;
    subtitleKey: string;
    icon: LucideIcon;
    colorClass: string;
  }
> = {
  curated: {
    titleKey: "home.seeAll.collection.curated.title",
    subtitleKey: "home.seeAll.collection.curated.subtitle",
    icon: Sparkles,
    colorClass: "text-secondary",
  },
  trending: {
    titleKey: "home.seeAll.collection.trending.title",
    subtitleKey: "home.seeAll.collection.trending.subtitle",
    icon: Flame,
    colorClass: "text-orange-500",
  },
};

export const SEE_ALL_COUNT_STEPS = [10, 20, 30] as const;

export const resolveSeeAllCollectionHeader = (
  collection: HomeRecommendationCollection,
  t: TranslateFn,
  moodId?: string,
): SeeAllCollectionHeader => {
  if (collection === "mood") {
    const moodOption = MOOD_OPTIONS.find((entry) => entry.id === moodId) ?? null;
    const moodLabel = moodOption
      ? t(`home.mood.${moodOption.id}.label`, undefined, moodOption.label)
      : t("home.mood.defaultTitle");
    return {
      title: t("home.seeAll.collection.mood.title", { mood: moodLabel }),
      subtitle: t("home.seeAll.collection.mood.subtitle", { mood: moodLabel }),
      icon: moodOption ? (MOOD_ICON_MAP[moodOption.icon] ?? Sparkles) : Sparkles,
      colorClass: "text-secondary dark:text-primary",
    };
  }

  const registry = STATIC_COLLECTION_REGISTRY[collection];
  return {
    title: t(registry.titleKey),
    subtitle: t(registry.subtitleKey),
    icon: registry.icon,
    colorClass: registry.colorClass,
  };
};

export const resetViewportScroll = (): void => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};
