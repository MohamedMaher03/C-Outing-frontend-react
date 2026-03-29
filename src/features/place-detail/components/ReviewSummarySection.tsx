import { memo, useState } from "react";
import {
  Sparkles,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReviewSummary } from "../types";
import { formatCountLabel, formatInteger } from "../utils/formatters";

interface ReviewSummarySectionProps {
  summary: ReviewSummary | null;
  loading: boolean;
}

/** NLP-generated Review Summary section */
const ReviewSummarySectionComponent = ({
  summary,
  loading,
}: ReviewSummarySectionProps) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/70 bg-card/95 p-5 space-y-3 animate-pulse">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </Card>
    );
  }

  if (!summary) return null;

  const maxTopicCount = summary.commonTopics.reduce(
    (max, topic) => Math.max(max, topic.count),
    1,
  );

  const sentimentColor = {
    positive: "text-secondary",
    neutral: "text-muted-foreground",
    negative: "text-destructive",
  };

  return (
    <Card className="rounded-2xl border-border/70 bg-card/95 p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-role-subheading text-secondary flex items-center gap-1.5 min-w-0">
          <Sparkles className="h-4 w-4" />
          <span className="truncate">Community Pulse</span>
        </h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span
            className={`pd-type-micro ${sentimentColor[summary.overallSentiment]}`}
          >
            {summary.overallSentiment.charAt(0).toUpperCase() +
              summary.overallSentiment.slice(1)}
          </span>
          <Badge
            variant="outline"
            className="gap-0.5 border-secondary/40 text-secondary pd-type-micro pd-type-number"
          >
            <Star className="h-3 w-3 fill-secondary" />
            {summary.averageRating.toFixed(1)}
          </Badge>
          <span
            className="pd-type-micro pd-type-number text-muted-foreground"
            dir="ltr"
          >
            ({formatCountLabel(summary.totalReviews, "review")})
          </span>
        </div>
      </div>

      {/* Summary text */}
      <p
        className="pd-type-body pd-measure text-muted-foreground break-words whitespace-pre-wrap"
        dir="auto"
      >
        {summary.summary}
      </p>

      {/* Highlights */}
      <div className="space-y-2">
        <p className="pd-type-kicker text-foreground">Key Highlights</p>
        {summary.highlights.length === 0 ? (
          <p className="pd-type-micro text-muted-foreground">
            No highlights available yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {summary.highlights.map((highlight, i) => (
              <Badge
                key={i}
                variant="outline"
                className="inline-flex items-center gap-1 border-secondary/30 bg-secondary/10 text-secondary max-w-full"
                dir="auto"
              >
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span className="break-words">{highlight}</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Expandable topics */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="h-9 justify-start gap-1 px-2 pd-type-label text-secondary hover:text-secondary"
      >
        <TrendingUp className="h-3.5 w-3.5" />
        {expanded ? "Hide" : "Show"} Common Topics
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </Button>

      {expanded && (
        <div className="space-y-2 pt-1">
          {summary.commonTopics.length === 0 ? (
            <p className="pd-type-micro text-muted-foreground">
              No common topics available yet.
            </p>
          ) : (
            summary.commonTopics.map((topic, i) => {
              const barWidth = Math.max((topic.count / maxTopicCount) * 100, 8);
              const barColor = {
                positive: "bg-secondary/80",
                neutral: "bg-muted-foreground/50",
                negative: "bg-destructive/70",
              };
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 pd-type-micro">
                    <span
                      className="text-foreground font-medium break-words min-w-0"
                      dir="auto"
                    >
                      {topic.topic}
                    </span>
                    <span
                      className="pd-type-number text-muted-foreground shrink-0"
                      dir="ltr"
                    >
                      {formatCountLabel(topic.count, "mention")}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor[topic.sentiment]}`}
                      style={{
                        width: `${Number.isFinite(barWidth) ? barWidth : 8}%`,
                      }}
                      aria-label={`${topic.topic}: ${formatInteger(topic.count)} mentions`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Card>
  );
};

export const ReviewSummarySection = memo(ReviewSummarySectionComponent);
ReviewSummarySection.displayName = "ReviewSummarySection";
