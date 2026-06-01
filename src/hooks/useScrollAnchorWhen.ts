import { useEffect, type RefObject } from "react";

export const useScrollAnchorWhen = (
  isActive: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  delayMs = 50,
) => {
  useEffect(() => {
    if (!isActive) return;

    const timerId = window.setTimeout(() => {
      anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [anchorRef, delayMs, isActive]);
};
