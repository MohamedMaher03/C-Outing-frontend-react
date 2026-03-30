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
          ? "border-secondary/45 bg-secondary/10 text-foreground hover:bg-secondary/15"
          : "border-border/80 bg-card text-muted-foreground hover:border-secondary/40 hover:text-foreground/90",
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
