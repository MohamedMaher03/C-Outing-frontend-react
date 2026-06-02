import { Share2 } from "lucide-react";
import { useI18n } from "@/components/i18n/useI18n";
import { useSessionShare } from "../hooks/useSessionShare";

interface SessionShareButtonProps {
  code: string;
}

export function SessionShareButton({ code }: SessionShareButtonProps) {
  const { t } = useI18n();
  const { shareSessionCode } = useSessionShare(code);

  return (
    <button
      type="button"
      onClick={() => void shareSessionCode()}
      className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[hsl(38,42%,58%)] px-4 text-xs font-bold text-[hsl(216,50%,14%)] transition-colors hover:bg-[hsl(38,42%,66%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(38,42%,58%)]/60"
    >
      <Share2 className="h-3.5 w-3.5" />
      {t("session.code.share")}
    </button>
  );
}
