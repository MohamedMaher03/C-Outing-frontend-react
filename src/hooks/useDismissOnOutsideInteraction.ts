import { useEffect } from "react";

export const useDismissOnOutsideInteraction = (
  activeTargetId: string | null,
  dismiss: () => void,
  rootAttribute: string,
) => {
  useEffect(() => {
    if (!activeTargetId || rootAttribute.trim().length === 0) return;

    const dismissIfOutside = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const withinRoot = target?.closest(
        `[${rootAttribute}="${activeTargetId}"]`,
      );

      if (!withinRoot) dismiss();
    };

    const dismissOnEscape = (event: KeyboardEvent) => {
      event.key === "Escape" && dismiss();
    };

    document.addEventListener("mousedown", dismissIfOutside);
    document.addEventListener("keydown", dismissOnEscape);

    return () => {
      document.removeEventListener("mousedown", dismissIfOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [activeTargetId, dismiss, rootAttribute]);
};
