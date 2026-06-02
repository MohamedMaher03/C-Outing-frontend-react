import type { Variants } from "framer-motion";

export const SESSION_MEMBER_CAP = 10;

export const MOTION_EASE_OUT_QUART = [0.25, 1, 0.5, 1] as [
  number,
  number,
  number,
  number,
];

export const MEMBER_AVATAR_SWATCHES = [
  "bg-[hsl(216,50%,28%)]",
  "bg-[hsl(38,42%,52%)]",
  "bg-[hsl(199,55%,40%)]",
  "bg-[hsl(280,40%,45%)]",
  "bg-[hsl(160,45%,38%)]",
  "bg-[hsl(0,50%,45%)]",
] as const;

export const SESSION_PAGE_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const MEMBER_AVATAR_DIMENSIONS = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export type MemberAvatarSize = keyof typeof MEMBER_AVATAR_DIMENSIONS;
