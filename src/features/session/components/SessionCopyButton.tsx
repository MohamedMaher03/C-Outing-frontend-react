import { Copy, Check } from "lucide-react";
import { useI18n } from "@/components/i18n/useI18n";
import { useSessionClipboard } from "../hooks/useSessionClipboard";

interface SessionCopyButtonProps {
  code: string;
}

export function SessionCopyButton({ code }: SessionCopyButtonProps) {
  const { t } = useI18n();
  const { copyAcknowledged, copySessionCode } = useSessionClipboard(code);

  return (
    <button
      type="button"
      onClick={() => void copySessionCode()}
      className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      {copyAcknowledged ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copyAcknowledged ? t("session.code.copied") : t("session.code.copy")}
    </button>
  );
}
