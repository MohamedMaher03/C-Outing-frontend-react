import { useState } from "react";
import {
  Sparkles,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReviewSummary } from "../types";

interface ReviewSummarySectionProps {
  summary: ReviewSummary | null;
  loading: boolean;
}

/** NLP-generated Review Summary section */
export const ReviewSummarySection = ({
  summary,
  loading,
}: ReviewSummarySectionProps) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5 space-y-3 animate-pulse">
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    );
  }

  if (!summary) return null;

  const sentimentColor = {
    positive: "text-emerald-600 dark:text-emerald-400",
    neutral: "text-amber-600 dark:text-amber-400",
    negative: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-secondary flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          AI Review Summary
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium ${sentimentColor[summary.overallSentiment]}`}
          >
            {summary.overallSentiment.charAt(0).toUpperCase() +
              summary.overallSentiment.slice(1)}
          </span>
          <Badge className="bg-secondary/10 text-secondary border-secondary/30 gap-0.5 text-xs">
            <Star className="h-3 w-3 fill-secondary" />
            {summary.averageRating}
          </Badge>
          <span className="text-xs text-muted-foreground">
            ({summary.totalReviews} reviews)
          </span>
        </div>
      </div>

      {/* Summary text */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {summary.summary}
      </p>

      {/* Highlights */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Key Highlights
        </p>
        <div className="flex flex-wrap gap-2">
          {summary.highlights.map((highlight, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium"
            >
              <CheckCircle2 className="h-3 w-3" />
              {highlight}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable topics */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80 transition-colors"
      >
        <TrendingUp className="h-3.5 w-3.5" />
        {expanded ? "Hide" : "Show"} Common Topics
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 pt-1">
          {summary.commonTopics.map((topic, i) => {
            const barWidth = Math.max(
              (topic.count /
                Math.max(...summary.commonTopics.map((t) => t.count))) *
                100,
              8,
            );
            const barColor = {
              positive: "bg-emerald-500/70",
              neutral: "bg-amber-500/70",
              negative: "bg-red-500/70",
            };
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">
                    {topic.topic}
                  </span>
                  <span className="text-muted-foreground">
                    {topic.count} mentions
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor[topic.sentiment]}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
