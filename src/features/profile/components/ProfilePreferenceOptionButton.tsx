import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfilePreferenceOptionButtonProps = {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export const ProfilePreferenceOptionButton = ({
  selected,
  onClick,
  children,
  icon,
  className,
}: ProfilePreferenceOptionButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "h-auto min-h-11 min-w-0 touch-manipulation whitespace-normal rounded-full border text-sm font-medium leading-tight transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] focus-visible:ring-primary/35 focus-visible:ring-offset-1 motion-reduce:transition-none motion-reduce:active:scale-100",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_24px_hsl(var(--primary)/0.25)] hover:bg-primary/90"
          : "border-border/80 bg-card text-foreground dark:text-cream hover:border-primary/45 hover:bg-primary/10 hover:text-primary",
        className,
      )}
    >
      {icon ? (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 break-words" dir="auto">
        {children}
      </span>
    </Button>
  );
};
