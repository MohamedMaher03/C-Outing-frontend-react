import { Flame, Loader2, Sparkles, type LucideIcon } from "lucide-react";
import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";
import {
  MAP_ATLAS_RECOMMENDATION_COUNT_OPTIONS,
  type MapAtlasRecommendationCount,
} from "@/features/map-atlas/constants/recommendationCount";

type RecommendationSource = "curated" | "trending";

const SOURCE_VISUAL: Record<
  RecommendationSource,
  { icon: LucideIcon; accentClass: string }
> = {
  curated: {
    icon: Sparkles,
    accentClass: "text-secondary dark:text-primary",
  },
  trending: {
    icon: Flame,
    accentClass: "text-orange-500",
  },
};

interface MapAtlasRecommendationCountSelectorProps {
  source: RecommendationSource;
  sourceLabel: string;
  count: MapAtlasRecommendationCount;
  onCountChange: (count: MapAtlasRecommendationCount) => void;
  isLoading?: boolean;
  className?: string;
}

export default function MapAtlasRecommendationCountSelector({
  source,
  sourceLabel,
  count,
  onCountChange,
  isLoading = false,
  className,
}: MapAtlasRecommendationCountSelectorProps) {
  const { t, formatNumber } = useI18n();
  const { icon: SourceIcon, accentClass } = SOURCE_VISUAL[source];

  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-border/65 bg-background/65 p-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card",
                accentClass,
              )}
            >
              <SourceIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-role-caption uppercase tracking-wide text-muted-foreground">
                {t(
                  "mapAtlas.recommendations.title",
                  undefined,
                  "How many places?",
                )}
              </p>
              <p className="mt-0.5 text-role-secondary text-muted-foreground">
                {t(
                  "mapAtlas.recommendations.subtitle",
                  { source: sourceLabel },
                  `Choose how many ${sourceLabel} picks appear on your map.`,
                )}
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            {t(
              "mapAtlas.recommendations.loading",
              undefined,
              "Refreshing...",
            )}
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label={t(
          "mapAtlas.recommendations.countGroup",
          undefined,
          "Number of places",
        )}
        className="grid grid-cols-3 gap-2"
      >
        {MAP_ATLAS_RECOMMENDATION_COUNT_OPTIONS.map((option) => {
          const active = count === option;

          return (
            <button
              key={`recommendation-count-${option}`}
              type="button"
              aria-pressed={active}
              disabled={isLoading}
              onClick={() => onCountChange(option)}
              className={cn(
                "group relative min-h-[4.25rem] rounded-2xl border px-3 py-3 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-70",
                active
                  ? "border-primary/85 bg-primary text-primary-foreground shadow-sm"
                  : "border-border/70 bg-card hover:border-primary/55 hover:bg-primary/10",
              )}
            >
              <span
                className={cn(
                  "text-lg font-black leading-none tabular-nums",
                  active ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {formatNumber(option)}
              </span>
              <span
                className={cn(
                  "mt-1 block text-[11px] font-semibold leading-tight",
                  active
                    ? "text-primary-foreground/85"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {t(
                  "mapAtlas.recommendations.countOption",
                  { count: formatNumber(option) },
                  `${formatNumber(option)} places`,
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
