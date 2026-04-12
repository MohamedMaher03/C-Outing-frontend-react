import {
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  AlertCircle,
  Shield,
  MessageSquare,
} from "lucide-react";
import type {
  AdminPlaceStatus,
  AdminReviewStatus,
  AdminToast,
} from "@/features/admin/types";
import type {
  ModerationAction,
  ReportedContent,
} from "@/features/moderator/types";

export const moderatorPlaceStatusConfig: Record<
  AdminPlaceStatus,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  active: {
    label: "Active",
    class: "bg-primary/10 text-primary border-primary/25",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    class: "bg-secondary/18 text-foreground border-secondary/30",
    icon: Clock,
  },
  flagged: {
    label: "Flagged",
    class: "bg-destructive/10 text-destructive border-destructive/30",
    icon: AlertTriangle,
  },
  removed: {
    label: "Removed",
    class: "bg-muted text-muted-foreground border-border",
    icon: XCircle,
  },
};

export const moderatorReviewStatusConfig: Record<
  AdminReviewStatus,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  published: {
    label: "Published",
    class: "bg-primary/10 text-primary border-primary/25",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    class: "bg-secondary/18 text-foreground border-secondary/30",
    icon: Clock,
  },
  flagged: {
    label: "Flagged",
    class: "bg-destructive/10 text-destructive border-destructive/30",
    icon: AlertTriangle,
  },
  removed: {
    label: "Removed",
    class: "bg-muted text-muted-foreground border-border",
    icon: XCircle,
  },
};

export const moderatorPlaceRowStateClass: Record<AdminPlaceStatus, string> = {
  active: "border-border bg-card",
  pending: "border-secondary/35 bg-secondary/12",
  flagged: "border-destructive/30 bg-destructive/5",
  removed: "border-border bg-muted/30",
};

export const moderatorReviewRowStateClass: Record<AdminReviewStatus, string> = {
  published: "border-border bg-card",
  pending: "border-secondary/35 bg-secondary/12",
  flagged: "border-destructive/30 bg-destructive/5",
  removed: "border-border bg-muted/30",
};

export const reportedStatusConfig: Record<
  ReportedContent["status"],
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  open: {
    label: "Open",
    class: "bg-destructive/10 text-destructive border-destructive/30",
    icon: AlertCircle,
  },
  investigating: {
    label: "Investigating",
    class: "bg-secondary/18 text-foreground border-secondary/30",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    class: "bg-primary/10 text-primary border-primary/25",
    icon: CheckCircle,
  },
  dismissed: {
    label: "Dismissed",
    class: "bg-muted text-muted-foreground border-border",
    icon: XCircle,
  },
};

export const reportedPriorityConfig: Record<
  ReportedContent["priority"],
  { label: string; class: string }
> = {
  high: { label: "High", class: "bg-destructive text-destructive-foreground" },
  medium: { label: "Medium", class: "bg-secondary text-secondary-foreground" },
  low: { label: "Low", class: "bg-primary text-primary-foreground" },
};

export const getReportedRowStateClass = (
  status: ReportedContent["status"],
  priority: ReportedContent["priority"],
): string => {
  if (status === "open" && priority === "high") {
    return "border-destructive/30 bg-destructive/5";
  }

  if (status === "investigating") {
    return "border-secondary/35 bg-secondary/12";
  }

  return "border-border bg-card";
};

export const moderationActionColor: Record<ModerationAction["action"], string> =
  {
    approved: "bg-primary/10 text-primary",
    removed: "bg-destructive/10 text-destructive",
    warned: "bg-secondary/18 text-foreground",
    escalated: "bg-primary/20 text-primary",
  };

export const moderationActionIcon = {
  approved: CheckCircle,
  removed: AlertTriangle,
  warned: MessageSquare,
  escalated: Shield,
};

export const moderatorToastClasses: Record<AdminToast["variant"], string> = {
  success:
    "border border-primary/25 bg-primary/12 text-foreground shadow-md dark:bg-primary/18",
  error:
    "border border-destructive/35 bg-destructive/10 text-destructive shadow-md",
  info: "border border-secondary/35 bg-secondary/15 text-foreground shadow-md",
  warning:
    "border border-secondary/45 bg-secondary/20 text-foreground shadow-md",
};
