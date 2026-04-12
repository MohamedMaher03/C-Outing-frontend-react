import { Ban, CheckCircle, AlertTriangle, Clock, XCircle } from "lucide-react";
import type {
  AdminReviewStatus,
  AdminToast,
  AdminUserRole,
  AdminUserStatus,
} from "../types";

export const userRoleBadge: Record<
  AdminUserRole,
  { label: string; class: string }
> = {
  admin: {
    label: "Admin",
    class: "bg-primary/12 text-primary border-primary/25",
  },
  moderator: {
    label: "Moderator",
    class: "bg-secondary/18 text-foreground border-secondary/30",
  },
  user: {
    label: "User",
    class: "bg-muted text-muted-foreground border-border",
  },
};

export const userStatusBadge: Record<
  AdminUserStatus,
  { label: string; class: string; icon: typeof CheckCircle }
> = {
  active: { label: "Active", class: "text-primary", icon: CheckCircle },
  banned: { label: "Banned", class: "text-destructive", icon: Ban },
  suspended: {
    label: "Suspended",
    class: "text-secondary",
    icon: AlertTriangle,
  },
};

export const placeStatusConfig: Record<
  string,
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

export const reviewStatusConfig: Record<
  string,
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

export const reviewRowStateClass: Record<AdminReviewStatus, string> = {
  published: "border-border bg-card",
  pending: "border-secondary/30 bg-secondary/10",
  flagged: "border-destructive/25 bg-destructive/5",
  removed: "border-border bg-muted/30",
};

export const adminToastClasses: Record<AdminToast["variant"], string> = {
  success:
    "border border-primary/25 bg-primary/12 text-foreground shadow-md dark:bg-primary/18",
  error:
    "border border-destructive/35 bg-destructive/10 text-destructive shadow-md",
  info: "border border-secondary/35 bg-secondary/15 text-foreground shadow-md",
  warning:
    "border border-secondary/45 bg-secondary/20 text-foreground shadow-md",
};
