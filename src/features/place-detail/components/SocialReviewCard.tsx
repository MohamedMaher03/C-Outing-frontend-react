import { memo } from "react";
import { ThumbsUp, Globe, Instagram, Twitter, Facebook } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SocialMediaReview } from "../types";
import { formatInteger, formatShortDate } from "../utils/formatters";

/** Platform icon for social reviews */
const PlatformIcon = ({ platform }: { platform: string }) => {
  const iconClass = "h-4 w-4";
  switch (platform) {
    case "instagram":
      return <Instagram className={`${iconClass} text-pink-500`} />;
    case "twitter":
      return <Twitter className={`${iconClass} text-sky-500`} />;
    case "facebook":
      return <Facebook className={`${iconClass} text-blue-600`} />;
    case "tiktok":
      return (
        <svg
          className={`${iconClass} text-foreground`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.63a8.28 8.28 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.04z" />
        </svg>
      );
    case "google":
      return <Globe className={`${iconClass} text-emerald-500`} />;
    default:
      return <Globe className={iconClass} />;
  }
};

/** Sentiment badge */
const SentimentBadge = ({
  sentiment,
}: {
  sentiment: "positive" | "neutral" | "negative";
}) => {
  const config = {
    positive: "border border-secondary/30 bg-secondary/15 text-secondary",
    neutral: "border border-border bg-muted text-muted-foreground",
    negative: "border border-destructive/30 bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`pd-type-micro px-2 py-0.5 rounded-full font-semibold ${config[sentiment]}`}
    >
      {sentiment}
    </span>
  );
};

/** A single social media review card */
const SocialReviewCardComponent = ({
  review,
}: {
  review: SocialMediaReview;
}) => (
  <Card className="rounded-2xl border-border/70 bg-card/95 p-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0 max-w-full">
        <PlatformIcon platform={review.platform} />
        <span
          className="pd-type-label text-foreground break-words line-clamp-1 max-w-[11rem] sm:max-w-none"
          dir="auto"
        >
          {review.author}
        </span>
        <SentimentBadge sentiment={review.sentiment} />
      </div>
      <span
        className="pd-type-micro pd-type-number text-muted-foreground shrink-0"
        dir="ltr"
      >
        {formatShortDate(review.date, {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
    <p
      className="pd-type-body pd-measure text-muted-foreground break-words whitespace-pre-wrap"
      dir="auto"
    >
      {review.content}
    </p>
    {review.likes !== undefined && (
      <div className="flex items-center gap-1 pd-type-micro pd-type-number text-muted-foreground">
        <ThumbsUp className="h-3 w-3" />
        <span dir="ltr">{formatInteger(review.likes)}</span>
      </div>
    )}
  </Card>
);

export const SocialReviewCard = memo(SocialReviewCardComponent);
SocialReviewCard.displayName = "SocialReviewCard";
