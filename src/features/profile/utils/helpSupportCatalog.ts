import { Mail, type LucideIcon } from "lucide-react";
import { normalizeSearchTerm } from "@/utils/textNormalization";

export const HELP_SUPPORT_EMAIL = "support@cairo-outing.com";
export const HELP_SUPPORT_MAILTO = `mailto:${HELP_SUPPORT_EMAIL}`;

export interface HelpContactOption {
  icon: LucideIcon;
  labelKey: string;
  mailto: string;
  available: boolean;
}

export const HELP_CONTACT_OPTIONS: HelpContactOption[] = [
  {
    icon: Mail,
    labelKey: "profile.help.contact.emailLabel",
    mailto: HELP_SUPPORT_MAILTO,
    available: true,
  },
];

export interface HelpFaqDescriptor {
  id: string;
  questionKey: string;
  answerKey: string;
}

export const HELP_FAQ_DESCRIPTORS: HelpFaqDescriptor[] = [
  {
    id: "recommendations",
    questionKey: "profile.help.faq.recommendations.question",
    answerKey: "profile.help.faq.recommendations.answer",
  },
  {
    id: "update-preferences",
    questionKey: "profile.help.faq.updatePreferences.question",
    answerKey: "profile.help.faq.updatePreferences.answer",
  },
  {
    id: "price-levels",
    questionKey: "profile.help.faq.priceLevels.question",
    answerKey: "profile.help.faq.priceLevels.answer",
  },
  {
    id: "manage-favorites",
    questionKey: "profile.help.faq.manageFavorites.question",
    answerKey: "profile.help.faq.manageFavorites.answer",
  },
  {
    id: "write-review",
    questionKey: "profile.help.faq.writeReview.question",
    answerKey: "profile.help.faq.writeReview.answer",
  },
  {
    id: "notifications",
    questionKey: "profile.help.faq.notifications.question",
    answerKey: "profile.help.faq.notifications.answer",
  },
  {
    id: "privacy-settings",
    questionKey: "profile.help.faq.privacySettings.question",
    answerKey: "profile.help.faq.privacySettings.answer",
  },
  {
    id: "delete-account",
    questionKey: "profile.help.faq.deleteAccount.question",
    answerKey: "profile.help.faq.deleteAccount.answer",
  },
];

export interface HelpTopicChipDescriptor {
  id: string;
  labelKey: string;
  queryKey: string;
}

export const HELP_TOPIC_CHIPS: HelpTopicChipDescriptor[] = [
  {
    id: "recommendations",
    labelKey: "profile.help.topic.recommendations.label",
    queryKey: "profile.help.topic.recommendations.query",
  },
  {
    id: "reviews",
    labelKey: "profile.help.topic.reviews.label",
    queryKey: "profile.help.topic.reviews.query",
  },
  {
    id: "privacy",
    labelKey: "profile.help.topic.privacy.label",
    queryKey: "profile.help.topic.privacy.query",
  },
  {
    id: "account",
    labelKey: "profile.help.topic.account.label",
    queryKey: "profile.help.topic.account.query",
  },
];

export interface LocalizedHelpFaq {
  id: string;
  question: string;
  answer: string;
}

type TranslateFn = (key: string) => string;

export const localizeHelpFaqs = (
  t: TranslateFn,
  descriptors: readonly HelpFaqDescriptor[] = HELP_FAQ_DESCRIPTORS,
): LocalizedHelpFaq[] =>
  descriptors.map(({ id, questionKey, answerKey }) => ({
    id,
    question: t(questionKey),
    answer: t(answerKey),
  }));

export const filterHelpFaqs = (
  faqs: readonly LocalizedHelpFaq[],
  searchQuery: string,
): LocalizedHelpFaq[] => {
  const normalizedQuery = normalizeSearchTerm(searchQuery);
  if (!normalizedQuery) return [...faqs];

  return faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(normalizedQuery) ||
      faq.answer.toLowerCase().includes(normalizedQuery),
  );
};

export const flipExpandedFaqId = (
  current: string | null,
  faqId: string,
): string | null => (current === faqId ? null : faqId);

export const openHelpMailClient = (): void => {
  window.location.href = HELP_SUPPORT_MAILTO;
};
