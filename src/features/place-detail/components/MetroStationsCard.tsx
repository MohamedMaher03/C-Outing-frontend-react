import { Route, Timer, TrainFront } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/i18n";
import type { MetroStation } from "@/features/place-detail/types";
import {
  formatMetroStationName,
  formatMetroStationTime,
  isMetroMetricMissing,
} from "@/features/place-detail/utils/formatters";

interface MetroStationsCardProps {
  stations: MetroStation[];
}

export function MetroStationsCard({ stations }: MetroStationsCardProps) {
  const { t, locale } = useI18n();

  if (stations.length === 0) return null;

  return (
    <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm space-y-3 sm:p-5 lg:col-span-2 max-w-full overflow-hidden">
      <div className="space-y-1 min-w-0">
        <h2 className="pd-type-kicker text-foreground inline-flex items-center gap-2 flex-wrap">
          <TrainFront className="h-4 w-4 text-accent shrink-0" />
          {t("placeDetail.metro.title")}
        </h2>
        <p className="pd-type-micro text-muted-foreground break-words">
          {t("placeDetail.metro.subtitle")}
        </p>
      </div>

      <ul className="space-y-2" role="list">
        {stations.map((station) => {
          const stationName = formatMetroStationName(
            station.stationName,
            locale,
          );
          const distance = formatMetroStationTime(station.distance, locale);
          const walkTime = formatMetroStationTime(station.time, locale);
          const hasDistance = !isMetroMetricMissing(station.distance);
          const hasWalkTime = !isMetroMetricMissing(station.time);

          return (
            <li
              key={`${station.rank}-${station.stationName}`}
              className="rounded-xl border border-border/70 bg-background/40 px-3 py-3 sm:px-4"
              aria-label={t("placeDetail.metro.stationAria", {
                rank: station.rank,
                name: stationName,
              })}
            >
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent pd-type-number pd-type-micro"
                    aria-hidden="true"
                  >
                    {station.rank}
                  </span>
                  <span
                    className="pd-type-label text-foreground break-words min-w-0 pt-0.5"
                    dir="auto"
                  >
                    {stationName}
                  </span>
                </div>

                {(hasDistance || hasWalkTime) && (
                  <div className="grid grid-cols-1 gap-2 w-full min-w-0 sm:flex sm:flex-wrap sm:w-auto sm:justify-end">
                    {hasDistance && (
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-border bg-muted/40 text-muted-foreground pd-type-micro pd-type-number min-h-8 w-full justify-start px-2.5 py-1 whitespace-normal sm:w-auto sm:justify-center"
                        title={t("placeDetail.metro.distanceLabel")}
                      >
                        <Route className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-medium opacity-80">
                          {t("placeDetail.metro.distanceShort")}
                        </span>
                        <span>{distance}</span>
                      </Badge>
                    )}
                    {hasWalkTime && (
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-accent/30 bg-accent/10 text-accent pd-type-micro pd-type-number min-h-8 w-full justify-start px-2.5 py-1 whitespace-normal sm:w-auto sm:justify-center"
                        title={t("placeDetail.metro.timeLabel")}
                      >
                        <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-medium opacity-80">
                          {t("placeDetail.metro.timeShort")}
                        </span>
                        <span>{walkTime}</span>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
