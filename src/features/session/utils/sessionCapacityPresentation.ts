import { SESSION_MEMBER_CAP } from "../constants/sessionPresentation";

export type CapacityBarTone = "at-cap" | "near-cap" | "healthy";

export const resolveCapacityFillPercent = (
  memberCount: number,
  cap = SESSION_MEMBER_CAP,
): number => Math.min((memberCount / cap) * 100, 100);

export const resolveCapacityBarTone = (
  memberCount: number,
  cap = SESSION_MEMBER_CAP,
): CapacityBarTone =>
  memberCount >= cap
    ? "at-cap"
    : memberCount >= 7
      ? "near-cap"
      : "healthy";

export const resolveCapacityBarClass = (tone: CapacityBarTone): string =>
  ({
    "at-cap": "bg-destructive",
    "near-cap": "bg-amber-500",
    healthy: "bg-[hsl(38,42%,58%)]",
  })[tone];

export const isSessionAtCapacity = (
  memberCount: number,
  cap = SESSION_MEMBER_CAP,
): boolean => memberCount >= cap;
