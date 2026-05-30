import { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n";

interface ReviewsPaginationProps {
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (pageIndex: number) => Promise<void>;
  className?: string;
}

export const ReviewsPagination = ({
  pageIndex,
  totalPages,
  totalCount,
  pageSize,
  loading = false,
  onPageChange,
  className,
}: ReviewsPaginationProps) => {
  const { t, formatNumber, isArabic } = useI18n();

  const [jumpValue, setJumpValue] = useState("");
  const [jumpError, setJumpError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPage = pageIndex + 1;

  const go = useCallback(
    (target: number) => {
      if (
        target < 1 ||
        target > totalPages ||
        target === currentPage ||
        loading
      )
        return;
      void onPageChange(target - 1); //here i convert to 0-based for the hook
    },
    [currentPage, loading, onPageChange, totalPages],
  );

  const handleJump = useCallback(() => {
    const trimmed = jumpValue.trim();
    if (!trimmed) return;

    const parsed = parseInt(trimmed, 10);
    if (
      isNaN(parsed) ||
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > totalPages
    ) {
      setJumpError(
        t("placeDetail.reviews.pagination.jumpError", {
          max: formatNumber(totalPages),
        }) ?? `Enter a number between 1 and ${totalPages}`,
      );
      inputRef.current?.focus();
      return;
    }

    setJumpError(null);
    setJumpValue("");
    go(parsed);
  }, [formatNumber, go, jumpValue, t, totalPages]);

  // All hooks are above this line — safe to bail out early now
  if (totalPages <= 1) return null;

  // Derived display values (safe after the early return)
  const firstItem = pageIndex * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalCount);

  /** Build the array of page-pill values, inserting "…" for gaps. */
  const buildPages = (): (number | "ellipsis-start" | "ellipsis-end")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [1];

    if (currentPage <= 4) {
      pages.push(2, 3, 4, 5, "ellipsis-end", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        "ellipsis-start",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        "ellipsis-start",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis-end",
        totalPages,
      );
    }

    return pages;
  };

  const pages = buildPages();

  const navBtnCls =
    "h-9 w-9 rounded-xl border border-border/70 bg-card/80 text-muted-foreground " +
    "hover:bg-accent/10 hover:text-accent hover:border-accent/30 " +
    "disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150";

  const iconCls = "h-3.5 w-3.5";

  return (
    <nav
      className={cn("flex flex-col items-center gap-2.5 pt-2", className)}
      aria-label={
        t("placeDetail.reviews.pagination.label") ?? "Reviews pagination"
      }
    >
      {/* ── Range counter ─────────────────────────────────────── */}
      <p
        className="pd-type-micro text-muted-foreground tabular-nums select-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatNumber(firstItem)}–{formatNumber(lastItem)}{" "}
        <span className="opacity-55">/ {formatNumber(totalCount)}</span>
      </p>

      {/* ── Page pills + prev/next ─────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-1",
          isArabic ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Prev */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            t("placeDetail.reviews.pagination.prev") ?? "Previous page"
          }
          disabled={currentPage === 1 || loading}
          onClick={() => go(currentPage - 1)}
          className={navBtnCls}
        >
          {isArabic ? (
            <ChevronRight className={iconCls} />
          ) : (
            <ChevronLeft className={iconCls} />
          )}
        </Button>

        {/* Desktop: numbered pills */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, idx) =>
            page === "ellipsis-start" || page === "ellipsis-end" ? (
              <span
                key={`${page}-${idx}`}
                className="w-8 text-center pd-type-micro text-muted-foreground/50 select-none"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={page}
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  t("placeDetail.reviews.pagination.goToPage", {
                    page: formatNumber(page),
                  }) ?? `Page ${page}`
                }
                aria-current={page === currentPage ? "page" : undefined}
                disabled={loading}
                onClick={() => go(page)}
                className={cn(
                  "h-9 w-9 rounded-xl pd-type-micro pd-type-number transition-colors duration-150",
                  page === currentPage
                    ? "bg-accent text-accent-foreground border border-accent/80 font-semibold pointer-events-none"
                    : "border border-border/70 bg-card/80 text-muted-foreground " +
                        "hover:bg-accent/10 hover:text-accent hover:border-accent/30",
                )}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <span className="sm:hidden px-3 pd-type-micro pd-type-number text-foreground tabular-nums select-none">
          {currentPage} / {totalPages}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("placeDetail.reviews.pagination.next") ?? "Next page"}
          disabled={currentPage === totalPages || loading}
          onClick={() => go(currentPage + 1)}
          className={navBtnCls}
        >
          {isArabic ? (
            <ChevronLeft className={iconCls} />
          ) : (
            <ChevronRight className={iconCls} />
          )}
        </Button>
      </div>

      {totalPages > 5 && (
        <div className="hidden sm:flex flex-col items-center gap-1 mt-0.5">
          <div
            className={cn(
              "flex items-center gap-2",
              isArabic ? "flex-row-reverse" : "flex-row",
            )}
          >
            <label
              htmlFor="reviews-page-jump"
              className="pd-type-micro text-muted-foreground whitespace-nowrap select-none"
            >
              {t("placeDetail.reviews.pagination.goToLabel") ?? "Go to page"}
            </label>

            <span
              className="h-4 w-px bg-border/60 shrink-0"
              aria-hidden="true"
            />

            <Input
              ref={inputRef}
              id="reviews-page-jump"
              type="number"
              min={1}
              max={totalPages}
              step={1}
              value={jumpValue}
              onChange={(e) => {
                setJumpValue(e.target.value);
                setJumpError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJump();
              }}
              disabled={loading}
              placeholder="–"
              aria-label={
                t("placeDetail.reviews.pagination.jumpInputLabel", {
                  max: formatNumber(totalPages),
                }) ?? `Page number (1–${totalPages})`
              }
              className={cn(
                "h-8 w-14 text-center pd-type-micro pd-type-number px-1 rounded-lg",
                "border-border/70 bg-card/80 focus-visible:ring-accent/40",
                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
                jumpError &&
                  "border-destructive/60 focus-visible:ring-destructive/30",
              )}
            />

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleJump}
              disabled={loading || !jumpValue.trim()}
              className={cn(
                "h-8 px-3 pd-type-micro rounded-lg border-border/70",
                "hover:bg-accent/10 hover:text-accent hover:border-accent/30",
                "disabled:opacity-40 transition-colors duration-150",
              )}
            >
              {t("placeDetail.reviews.pagination.goButton") ?? "Go"}
            </Button>
          </div>

          <p
            className={cn(
              "pd-type-micro text-destructive/80 transition-opacity duration-150 h-4",
              jumpError ? "opacity-100" : "opacity-0 select-none",
            )}
            aria-live="polite"
            role="alert"
          >
            {jumpError ?? " "}
          </p>
        </div>
      )}

      {/* ── Loading spinner ───────────────────────────────────── */}
      {loading && (
        <div
          className="flex items-center gap-1.5 pd-type-micro text-muted-foreground"
          aria-live="polite"
        >
          <span className="inline-block h-3 w-3 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
          <span>{t("placeDetail.reviews.loadingMore") ?? "Loading…"}</span>
        </div>
      )}
    </nav>
  );
};
