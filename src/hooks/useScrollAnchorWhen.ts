import { useEffect, type RefObject } from "react";

export const useScrollAnchorWhen = <TAnchorElement extends HTMLElement>(
  isActive: boolean,
  anchorRef: RefObject<TAnchorElement | null>,
  delayMs = 50,
) => {
  useEffect(() => {
    if (!isActive || delayMs < 0) return;

    const timerId = window.setTimeout(() => {
      anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [anchorRef, delayMs, isActive]);
};
