import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface ProfileStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  numeric?: boolean;
  hint?: string;
  stretch?: boolean;
}

export const ProfileStatCard = ({
  icon: Icon,
  label,
  value,
  numeric = false,
  hint,
  stretch = false,
}: ProfileStatCardProps) => (
  <Card
    className={`${stretch ? "h-full " : ""}rounded-2xl border-border/70 bg-gradient-to-br from-card to-muted/30 shadow-sm`}
  >
    <CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-role-caption uppercase tracking-wide">{label}</p>
      </div>
      <p
        className={
          numeric
            ? "mt-2 text-role-subheading text-numeric-tabular text-foreground"
            : "mt-2 text-role-secondary font-semibold text-foreground break-words"
        }
      >
        {value}
      </p>
      {hint ? (
        <p className="text-role-micro text-foreground/78 dark:text-foreground/82 mt-3">
          {hint}
        </p>
      ) : null}
    </CardContent>
  </Card>
);
