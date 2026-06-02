import { Clock, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import type { usePlaceCard } from "@/features/home/hooks/usePlaceCard";

type PlaceCardBodyProps = Pick<
  ReturnType<typeof usePlaceCard>,
  | "t"
  | "venueName"
  | "venueAddress"
  | "atmosphereTags"
  | "openStatusLabel"
  | "openStatusTone"
  | "distanceCaption"
  | "distanceChipClass"
  | "priceBand"
>;

export const PlaceCardBody = ({
  t,
  venueName,
  venueAddress,
  atmosphereTags,
  openStatusLabel,
  openStatusTone,
  distanceCaption,
  distanceChipClass,
  priceBand,
}: PlaceCardBodyProps) => (
  <div className="flex flex-col flex-1 space-y-2 p-4 sm:p-5">
    <h3
      className="text-sm font-semibold leading-tight text-foreground transition-colors line-clamp-2 break-words"
      title={venueName}
    >
      {venueName}
    </h3>

    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-1.5 text-role-micro text-muted-foreground min-w-0">
        <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground dark:text-foreground/85" />
        <span className="truncate" title={venueAddress}>
          {venueAddress}
        </span>
      </div>
      {openStatusLabel && (
        <div
          className={cn(
            "ml-1 flex flex-shrink-0 items-center gap-1 text-xs font-semibold",
            openStatusTone,
          )}
        >
          <Clock className="h-3 w-3" />
          {openStatusLabel}
        </div>
      )}
    </div>

    <div className={distanceChipClass} aria-live="polite">
      <Navigation className="h-3 w-3" />
      <span>{distanceCaption}</span>
    </div>

    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 mt-auto">
      <div className="flex gap-1.5 overflow-hidden flex-1 min-w-0">
        {atmosphereTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border/40 bg-muted/70 px-2.5 py-1 text-xs font-medium text-muted-foreground flex-shrink-0 max-w-[126px] truncate"
            title={tag}
          >
            {tag}
          </span>
        ))}
      </div>
      {priceBand ? (
        <span
          className="ml-auto inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-[11px] font-medium text-foreground"
          aria-label={t("home.place.budgetLevel", { label: priceBand.label })}
          title={t("home.place.budgetLevel", { label: priceBand.label })}
        >
          <span>{priceBand.label}</span>
          <span className="text-[11px] font-semibold text-secondary/80 dark:text-primary">
            {priceBand.symbol}
          </span>
        </span>
      ) : (
        <span className="ml-auto inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-dashed border-secondary/20 bg-secondary/10 px-2.5 py-1 text-[11px] font-medium text-foreground opacity-60">
          <span>{t("home.place.priceUnknown")}</span>
        </span>
      )}
    </div>
  </div>
);
