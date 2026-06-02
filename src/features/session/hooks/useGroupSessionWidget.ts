import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n/useI18n";
import {
  isCompleteJoinCode,
  sanitizeJoinCodeInput,
} from "../utils/sessionCode";

export type GroupSessionWidgetMode = "idle" | "join";

export const useGroupSessionWidget = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [panelMode, setPanelMode] = useState<GroupSessionWidgetMode>("idle");
  const [joinCodeDraft, setJoinCodeDraft] = useState("");
  const [joinValidationMessage, setJoinValidationMessage] = useState<
    string | null
  >(null);

  const openCreateFlow = useCallback(() => {
    navigate("/session?action=create");
  }, [navigate]);

  const dismissJoinPanel = useCallback(() => {
    setPanelMode("idle");
    setJoinCodeDraft("");
    setJoinValidationMessage(null);
  }, []);

  const toggleJoinPanel = useCallback(() => {
    setPanelMode((current) => (current === "join" ? "idle" : "join"));
    setJoinValidationMessage(null);
  }, []);

  const revealJoinPanel = useCallback(() => {
    setPanelMode("join");
    setJoinValidationMessage(null);
  }, []);

  const onJoinCodeDraftChange = useCallback((raw: string) => {
    setJoinCodeDraft(sanitizeJoinCodeInput(raw));
    setJoinValidationMessage(null);
  }, []);

  const submitJoinCode = useCallback(() => {
    if (!isCompleteJoinCode(joinCodeDraft)) {
      setJoinValidationMessage(t("session.widget.join.error"));
      return;
    }
    navigate(`/session?action=join&code=${joinCodeDraft}`);
  }, [joinCodeDraft, navigate, t]);

  const isJoinCodeComplete = isCompleteJoinCode(joinCodeDraft);

  return {
    panelMode,
    joinCodeDraft,
    joinValidationMessage,
    isJoinCodeComplete,
    openCreateFlow,
    dismissJoinPanel,
    toggleJoinPanel,
    revealJoinPanel,
    onJoinCodeDraftChange,
    submitJoinCode,
  };
};
