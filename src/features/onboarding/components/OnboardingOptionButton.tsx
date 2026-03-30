import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OnboardingOptionButtonProps = {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
  shape?: "soft" | "pill";
};

export const OnboardingOptionButton = ({
  selected,
  onClick,
  children,
  icon,
  className,
  contentClassName,
  shape = "soft",
}: OnboardingOptionButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "h-auto min-h-11 min-w-0 touch-manipulation whitespace-normal border text-sm font-medium leading-tight transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] focus-visible:ring-primary/35 focus-visible:ring-offset-1 motion-reduce:transition-none motion-reduce:active:scale-100",
        shape === "pill" ? "rounded-full" : "rounded-xl",
        selected
          ? "border-primary/25 bg-primary/5 text-foreground hover:bg-primary/10"
          : "border-border/80 bg-card/90 text-foreground/80 hover:border-primary/25 hover:text-foreground/90",
        className,
      )}
    >
      {icon ? (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={cn("min-w-0 break-words", contentClassName)} dir="auto">
        {children}
      </span>
    </Button>
  );
};
