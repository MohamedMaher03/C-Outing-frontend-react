import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n";

interface MenuImageGalleryProps {
  images: string[];
  placeName: string;
  onImageOpen?: () => void;
}

export function MenuImageGallery({
  images,
  placeName,
  onImageOpen,
}: MenuImageGalleryProps) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const safeImages = useMemo(
    () =>
      Array.from(new Set(images.filter((image) => image.trim().length > 0))),
    [images],
  );

  useEffect(() => {
    if (!previewOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
        return;
      }

      if (safeImages.length <= 1) return;

      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % safeImages.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === 0 ? safeImages.length - 1 : prev - 1,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewOpen, safeImages.length]);

  if (safeImages.length === 0) return null;

  const openPreview = (index: number) => {
    setActiveIndex(index);
    setPreviewOpen(true);
    onImageOpen?.();
  };

  const showPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const showNext = () => {
    setActiveIndex((prev) => (prev + 1) % safeImages.length);
  };

  return (
    <>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => openPreview(index)}
              className="group relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/30"
              aria-label={t("placeDetail.menu.openPreview")}
            >
              <img
                src={image}
                alt={t("placeDetail.menu.photoAlt", {
                  place: placeName,
                  index: index + 1,
                })}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 inline-flex items-center justify-between gap-1 bg-background/80 px-2 py-1 pd-type-micro pd-type-number text-foreground backdrop-blur-sm">
                <span>
                  {t("placeDetail.menu.previewCount", {
                    current: index + 1,
                    total: safeImages.length,
                  })}
                </span>
                <Expand className="h-3.5 w-3.5 text-accent" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="pd-type-label text-foreground">
                {t("placeDetail.menu.fullscreenTitle")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => setPreviewOpen(false)}
                aria-label={t("placeDetail.menu.closePreview")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              <img
                src={safeImages[activeIndex]}
                alt={t("placeDetail.menu.photoAlt", {
                  place: placeName,
                  index: activeIndex + 1,
                })}
                className="max-h-[78vh] w-auto max-w-full rounded-xl border border-border/70 bg-card object-contain"
                loading="eager"
                decoding="async"
              />

              {safeImages.length > 1 && (
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
          </div>
        </div>
      )}
    </>
  );
}
