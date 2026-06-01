import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/components/i18n";
import {
  filterHelpFaqs,
  flipExpandedFaqId,
  HELP_CONTACT_OPTIONS,
  HELP_SUPPORT_EMAIL,
  HELP_TOPIC_CHIPS,
  localizeHelpFaqs,
  openHelpMailClient,
} from "@/features/profile/utils/helpSupportCatalog";

export const useHelpSupportPage = () => {
  const navigate = useNavigate();
  const { t, direction } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const quickTopics = useMemo(
    () =>
      HELP_TOPIC_CHIPS.map((topic) => ({
        ...topic,
        label: t(topic.labelKey),
        query: t(topic.queryKey),
      })),
    [t],
  );

  const localizedFaqs = useMemo(() => localizeHelpFaqs(t), [t]);
  const filteredFaqs = useMemo(
    () => filterHelpFaqs(localizedFaqs, searchQuery),
    [localizedFaqs, searchQuery],
  );

  const toggleFaqPanel = useCallback((faqId: string) => {
    setExpandedFaqId((current) => flipExpandedFaqId(current, faqId));
  }, []);

  const applyTopicSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const returnToProfile = useCallback(() => navigate("/profile"), [navigate]);

  return {
    t,
    direction,
    searchQuery,
    setSearchQuery,
    expandedFaqId,
    toggleFaqPanel,
    quickTopics,
    filteredFaqs,
    contactOptions: HELP_CONTACT_OPTIONS,
    supportEmail: HELP_SUPPORT_EMAIL,
    openSupportEmail: openHelpMailClient,
    applyTopicSearch,
    returnToProfile,
  };
};
