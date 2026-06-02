import { useI18n } from "@/components/i18n/useI18n";
import { cn } from "@/lib/utils";
import {
  DEFAULT_RECOMMENDATION_COUNT,
  RECOMMENDATION_COUNT_OPTIONS,
  type RecommendationCount,
} from "../types/session.types";

interface RecommendationCountSelectorProps {
  value: RecommendationCount;
  onChange: (count: RecommendationCount) => void;
  disabled?: boolean;
}

export function RecommendationCountSelector({
  value,
  onChange,
  disabled,
}: RecommendationCountSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {t("session.page.recs.count.label")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("session.page.recs.count.hint")}
          </p>
        </div>

        <div
          className="inline-flex w-full items-stretch gap-1 rounded-xl border border-border/70 bg-muted/50 p-1 sm:w-auto"
          role="radiogroup"
          aria-label={t("session.page.recs.count.label")}
        >
          {RECOMMENDATION_COUNT_OPTIONS.map((count) => {
            const isActive = count === value;

            return (
              <button
                key={count}
                type="button"
                role="radio"
                aria-checked={isActive}
                disabled={disabled || isActive}
                onClick={() => onChange(count)}
                className={cn(
                  "relative inline-flex min-h-10 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(38,42%,58%)]/60 disabled:cursor-default sm:flex-none",
                  isActive
                    ? "border-[hsl(38,42%,58%)]/50 bg-[hsl(216,50%,16%)] text-white shadow-sm dark:bg-[hsl(38,42%,58%)] dark:text-[hsl(216,50%,14%)]"
                    : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-background/80 hover:text-foreground disabled:opacity-100",
                )}
              >
                <span className="text-sm font-bold">{count}</span>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none",
                    isActive
                      ? "text-white/75 dark:text-[hsl(216,50%,14%)]/75"
                      : "",
                  )}
                >
                  {count === DEFAULT_RECOMMENDATION_COUNT
                    ? t("session.page.recs.count.recommended")
                    : t("session.page.recs.count.places")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
