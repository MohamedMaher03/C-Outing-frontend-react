import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatEgyptianHoursText,
  formatDayRange,
  groupConsecutiveDays,
  parseHoursString,
} from "@/features/place-detail/utils/openHours";

interface OpenHoursCardProps {
  hoursText: string;
  isOpen?: boolean | null;
  isArabic: boolean;
  t: (
    key: string,
    values?: Record<string, string | number>,
    fallback?: string,
  ) => string;
}

export const OpenHoursCard = ({
  hoursText,
  isOpen,
  isArabic,
  t,
}: OpenHoursCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const openStatusCopy =
    isOpen === true
      ? t("placeDetail.status.openNow")
      : isOpen === false
        ? t("home.place.closed")
        : isOpen === null
          ? t("placeDetail.status.unknown")
          : null;

  const dayLabelByEnglishName: Record<string, string> = {
    Saturday: t("placeDetail.hours.day.saturday"),
    Sunday: t("placeDetail.hours.day.sunday"),
    Monday: t("placeDetail.hours.day.monday"),
    Tuesday: t("placeDetail.hours.day.tuesday"),
    Wednesday: t("placeDetail.hours.day.wednesday"),
    Thursday: t("placeDetail.hours.day.thursday"),
    Friday: t("placeDetail.hours.day.friday"),
  };

  const localizeDayName = (day: string): string => {
    return dayLabelByEnglishName[day] ?? day;
  };

  const parsed = useMemo(() => parseHoursString(hoursText), [hoursText]);
  const grouped = useMemo(() => groupConsecutiveDays(parsed), [parsed]);

  const todayEntry = parsed.find((day) => day.isToday);
  const hasMultipleDays = parsed.length > 1;
  const canRender = parsed.length > 0;

  return (
    <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-3 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="pd-type-kicker text-foreground inline-flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          {t("placeDetail.hours.title")}
        </h2>
        {openStatusCopy && (
          <Badge
            variant="outline"
            className={cn(
              "font-semibold shrink-0",
              isOpen === true
                ? "border-accent/40 bg-accent/10 text-accent"
                : isOpen === false
                  ? "border-border text-muted-foreground bg-muted/40"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
            )}
          >
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
                isOpen === true
                  ? "bg-accent"
                  : isOpen === false
                    ? "bg-muted-foreground"
                    : "bg-amber-500",
              )}
            />
            {openStatusCopy}
          </Badge>
        )}
      </div>

      {!canRender ? (
        <div className="rounded-xl border border-border/70 bg-background/40 px-3 py-3 sm:px-4">
          <p className="pd-type-label text-foreground break-words" dir="auto">
            {hoursText || t("placeDetail.hours.unavailable")}
          </p>
        </div>
      ) : (
        <>
          {todayEntry && !expanded && (
            <div className="rounded-xl border border-accent/30 bg-accent/8 px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="pd-type-micro text-accent/80 font-medium">
                    {t("placeDetail.hours.today")} -{" "}
                    {localizeDayName(todayEntry.day)}
                  </p>
                  <p className="pd-type-label text-foreground font-semibold">
                    {formatEgyptianHoursText(todayEntry.hours, isArabic)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(expanded || !todayEntry) && (
            <div className="rounded-xl border border-border/70 bg-background/40 overflow-hidden divide-y divide-border/50">
              {grouped.map((group, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4",
                    group.isToday
                      ? "bg-accent/8 border-l-2 border-l-accent"
                      : "hover:bg-muted/30 transition-colors",
                  )}
                >
                  <span
                    className={cn(
                      "pd-type-micro shrink-0 flex items-center gap-1.5",
                      group.isToday
                        ? "text-accent font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDayRange(group.days, localizeDayName)}
                    {group.isToday && (
                      <span className="pd-type-micro text-accent/70 font-normal bg-accent/10 rounded px-1 py-px">
                        {t("placeDetail.hours.today")}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "pd-type-micro pd-type-number text-right",
                      group.isToday
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatEgyptianHoursText(group.hours, isArabic)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {hasMultipleDays && todayEntry && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 pd-type-micro text-muted-foreground hover:text-foreground transition-colors py-1 pd-focus-ring rounded-lg",
              )}
              aria-expanded={expanded}
            >
              <Clock className="h-3 w-3" />
              {expanded
                ? t("placeDetail.hours.hideAll")
                : t("placeDetail.hours.showAll")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  expanded ? "rotate-180" : "rotate-0",
                )}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </>
      )}
    </Card>
  );
};
