import { useEffect } from "react";

export const useDismissOnOutsideInteraction = (
  activeTargetId: string | null,
  dismiss: () => void,
  rootAttribute: string,
) => {
  useEffect(() => {
    if (!activeTargetId) return;

    const dismissIfOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const withinRoot = target?.closest(
        `[${rootAttribute}="${activeTargetId}"]`,
      );

      if (!withinRoot) dismiss();
    };

    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    document.addEventListener("mousedown", dismissIfOutside);
    document.addEventListener("keydown", dismissOnEscape);

    return () => {
      document.removeEventListener("mousedown", dismissIfOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [activeTargetId, dismiss, rootAttribute]);
};
