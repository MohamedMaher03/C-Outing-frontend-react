import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-lg border bg-card text-card-foreground", {
  variants: {
    elevation: {
      flat: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    },
  },
  defaultVariants: {
    elevation: "sm",
  },
});

const cardSectionVariants = cva("", {
  variants: {
    spacing: {
      compact: "p-4",
      default: "p-6",
      relaxed: "p-8",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, elevation, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ elevation }), className)}
    {...props}
  />
));
Card.displayName = "Card";

interface CardSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardSectionVariants> {}

const CardHeader = React.forwardRef<
  HTMLDivElement,
  CardSectionProps
>(({ className, spacing, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", cardSectionVariants({ spacing }), className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  CardSectionProps
>(({ className, spacing, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardSectionVariants({ spacing }), "pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  CardSectionProps
>(({ className, spacing, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", cardSectionVariants({ spacing }), "pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
