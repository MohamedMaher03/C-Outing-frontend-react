import { useCallback } from "react";
import { useI18n } from "@/components/i18n/useI18n";

export const useSessionShare = (sessionCode: string) => {
  const { t } = useI18n();

  const shareSessionCode = useCallback(async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: t("session.share.title"),
          text: t("session.share.text", { code: sessionCode }),
        });
      } catch {
        return;
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(sessionCode);
    } catch {
      return;
    }
  }, [sessionCode, t]);

  return { shareSessionCode };
};
