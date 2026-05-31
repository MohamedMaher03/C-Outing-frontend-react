import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n";
import type { MenuItem } from "@/features/place-detail/types";

interface MenuImageGalleryProps {
  items: MenuItem[];
  placeName: string;
  onImageOpen?: () => void;
}

export function MenuImageGallery({
  items,
  placeName,
  onImageOpen,
}: MenuImageGalleryProps) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const safeItems = useMemo(() => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const url = item.url.trim();
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [items]);

  useEffect(() => {
    if (!previewOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
        return;
      }

      if (safeItems.length <= 1) return;

      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % safeItems.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === 0 ? safeItems.length - 1 : prev - 1,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewOpen, safeItems.length]);

  if (safeItems.length === 0) return null;

  const activeItem = safeItems[activeIndex];

  const openPreview = (index: number) => {
    setActiveIndex(index);
    setPreviewOpen(true);
    onImageOpen?.();
  };

  const showPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? safeItems.length - 1 : prev - 1));
  };

  const showNext = () => {
    setActiveIndex((prev) => (prev + 1) % safeItems.length);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 min-w-0">
        {safeItems.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => openPreview(index)}
            className="group relative aspect-[4/3] w-full min-w-0 overflow-hidden rounded-xl border border-border/70 bg-muted/30"
            aria-label={t("placeDetail.menu.openPreview")}
          >
              <img
                src={item.url}
                alt={t("placeDetail.menu.photoAlt", {
                  place: placeName,
                  index: index + 1,
                })}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 inline-flex items-center justify-between gap-1 bg-background/80 px-2 py-1 pd-type-micro pd-type-number text-foreground backdrop-blur-sm">
                <span className="min-w-0 truncate">
                  {item.date?.trim() ||
                    t("placeDetail.menu.previewCount", {
                      current: index + 1,
                      total: safeItems.length,
                    })}
                </span>
                <Expand className="h-3.5 w-3.5 shrink-0 text-accent" />
              </span>
            </button>
          ))}
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <p className="pd-type-label text-foreground">
                  {t("placeDetail.menu.fullscreenTitle")}
                </p>
                {activeItem.date?.trim() && (
                  <p className="pd-type-micro text-muted-foreground">
                    {t("placeDetail.menu.capturedOn", {
                      date: activeItem.date.trim(),
                    })}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={() => setPreviewOpen(false)}
                aria-label={t("placeDetail.menu.closePreview")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              <img
                src={activeItem.url}
                alt={t("placeDetail.menu.photoAlt", {
                  place: placeName,
                  index: activeIndex + 1,
                })}
                className="max-h-[78vh] w-auto max-w-full rounded-xl border border-border/70 bg-card object-contain"
                loading="eager"
                decoding="async"
              />

              {safeItems.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute left-2 h-11 w-11 sm:left-4"
                    onClick={showPrevious}
                    aria-label={t("placeDetail.menu.previousPhoto")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute right-2 h-11 w-11 sm:right-4"
                    onClick={showNext}
                    aria-label={t("placeDetail.menu.nextPhoto")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <p className="mt-3 text-center pd-type-micro pd-type-number text-muted-foreground">
              {t("placeDetail.menu.previewCount", {
                current: activeIndex + 1,
                total: safeItems.length,
              })}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
