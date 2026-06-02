import { useCallback, useState } from "react";

const COPY_ACK_MS = 2_000;

export const useSessionClipboard = (sessionCode: string) => {
  const [copyAcknowledged, setCopyAcknowledged] = useState(false);

  const copySessionCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopyAcknowledged(true);
      window.setTimeout(() => setCopyAcknowledged(false), COPY_ACK_MS);
    } catch {
      return;
    }
  }, [sessionCode]);

  return { copyAcknowledged, copySessionCode };
};
