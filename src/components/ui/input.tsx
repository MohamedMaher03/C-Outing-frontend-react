import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      scale: {
        sm: "h-9 px-3 py-1.5 text-sm",
        md: "h-10 px-3 py-2 text-base md:text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      scale: "md",
    },
  },
);

interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", scale, ...props }, ref) => {
    const normalizedType = type?.trim() || "text";

    return (
      <input
        type={normalizedType}
        className={cn(inputVariants({ scale }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
