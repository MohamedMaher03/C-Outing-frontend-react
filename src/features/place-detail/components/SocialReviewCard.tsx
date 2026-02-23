import { ThumbsUp, Globe, Instagram, Twitter, Facebook } from "lucide-react";
import type { SocialMediaReview } from "../types";

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
    positive:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    neutral:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config[sentiment]}`}
    >
      {sentiment}
    </span>
  );
};

/** A single social media review card */
export const SocialReviewCard = ({ review }: { review: SocialMediaReview }) => (
  <div className="border border-border rounded-xl p-4 space-y-2 bg-card">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <PlatformIcon platform={review.platform} />
        <span className="text-sm font-semibold text-foreground">
          {review.author}
        </span>
        <SentimentBadge sentiment={review.sentiment} />
      </div>
      <span className="text-xs text-muted-foreground">
        {new Date(review.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      {review.content}
    </p>
    {review.likes !== undefined && (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ThumbsUp className="h-3 w-3" />
        <span>{review.likes.toLocaleString()}</span>
      </div>
    )}
  </div>
);
