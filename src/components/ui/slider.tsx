import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center py-1",
  {
    variants: {
      scale: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: {
      scale: "md",
    },
  },
);

const trackVariants = cva(
  "relative w-full grow overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      scale: {
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      scale: "md",
    },
  },
);

const thumbVariants = cva(
  "block rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      scale: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
      },
    },
    defaultVariants: {
      scale: "md",
    },
  },
);

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, scale, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(sliderVariants({ scale }), className)}
    {...props}
  >
    <SliderPrimitive.Track className={cn(trackVariants({ scale }))}>
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={cn(thumbVariants({ scale }))} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
