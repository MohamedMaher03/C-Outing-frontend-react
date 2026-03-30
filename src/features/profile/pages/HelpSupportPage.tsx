import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  ChevronRight,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "farouqdiaaeldin@gmail.com";
const SUPPORT_EMAIL_HREF = `mailto:${SUPPORT_EMAIL}`;

type ContactOption = {
  icon: LucideIcon;
  label: string;
  description: string;
  action: () => void;
  available: boolean;
};

const openSupportEmail = () => {
  window.location.href = SUPPORT_EMAIL_HREF;
};

const CONTACT_OPTIONS: ContactOption[] = [
  {
    icon: Mail,
    label: "Email Support",
    description: SUPPORT_EMAIL,
    action: openSupportEmail,
    available: true,
  },
];

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    id: "recommendations",
    question: "How do personalized recommendations work?",
    answer:
      "Recommendations are based on your onboarding choices, vibe level, preferred areas, and activity such as saved places and reviews.",
  },
  {
    id: "update-preferences",
    question: "How do I update my interests, vibe, budget, or areas?",
    answer:
      "Open Profile, go to Preferences, and update your selections. New recommendations will reflect your latest choices.",
  },
  {
    id: "manage-favorites",
    question: "How do I save and manage favorite places?",
    answer:
      "Tap the heart icon on any place to save it. You can remove saved places anytime from Favorites or from the place card.",
  },
  {
    id: "write-review",
    question: "How do I write or edit my review for a place?",
    answer:
      "Open a place details page to add your rating and comment. If you already reviewed that place, use Edit on your existing review.",
  },
  {
    id: "notifications",
    question: "How can I control my notifications?",
    answer:
      "Go to Profile > Notifications to turn push and email updates on or off.",
  },
  {
    id: "privacy-settings",
    question: "What privacy settings can I change?",
    answer:
      "In Profile > Privacy & Data, you can control visibility, analytics, and personalized recommendations.",
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer:
      "Go to Profile > Privacy & Data and choose Delete my account. This is permanent and removes your profile, favorites, and preferences.",
  },
];

const QUICK_TOPICS = [
  { label: "Recommendations", query: "recommendations" },
  { label: "Reviews", query: "review" },
  { label: "Privacy", query: "privacy" },
  { label: "Account", query: "account" },
];

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) {
      return FAQS;
    }

    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(normalizedQuery) ||
        faq.answer.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const toggleFaq = useCallback((faqId: string) => {
    setExpandedFaq((previous) => (previous === faqId ? null : faqId));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            aria-label="Back to profile"
            className="h-11 w-11 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-secondary" />
            <h1 className="text-role-subheading text-foreground">
              Help & Support
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-8 pt-[clamp(1rem,2vw,1.5rem)] grid gap-[clamp(1rem,2.2vw,1.9rem)] lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Contact Support */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <h2 className="text-role-body font-semibold text-foreground">
            Contact Support
          </h2>
          <div className="grid gap-3">
            {CONTACT_OPTIONS.map((option) => (
              <Card
                key={option.label}
                className={cn(
                  "rounded-xl border-border transition-colors",
                  option.available
                    ? "hover:bg-muted/50"
                    : "opacity-50 cursor-not-allowed",
                )}
              >
                <CardContent className="p-0">
                  <button
                    type="button"
                    onClick={option.action}
                    disabled={!option.available}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <option.icon className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-role-secondary font-semibold text-foreground break-words">
                          {option.label}
                          {!option.available && (
                            <span className="ml-2 text-role-caption text-muted-foreground">
                              (Coming Soon)
                            </span>
                          )}
                        </p>
                        <p className="text-role-caption text-muted-foreground break-all">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {option.available && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-xl border-border/70 bg-card/60">
            <CardContent className="space-y-2 p-3 text-center lg:text-left">
              <p className="text-role-caption text-muted-foreground">
                C-Outing App v1.0.0
              </p>
              <p className="text-role-caption text-muted-foreground/80">
                We usually reply within one business day.
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* FAQ Section */}
        <section className="space-y-[clamp(0.75rem,1.8vw,1.25rem)]">
          <div className="flex items-center justify-between">
            <h2 className="text-role-body font-semibold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics"
              maxLength={120}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((topic) => (
              <Button
                key={topic.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(topic.query)}
                className="rounded-full border-border/80 bg-card/60 px-3"
              >
                {topic.label}
              </Button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/50">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const panelId = `faq-panel-${faq.id}`;
                const isExpanded = expandedFaq === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/25 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
                    >
                      <p className="text-role-secondary font-semibold text-foreground text-left break-words pr-3">
                        {faq.question}
                      </p>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none",
                          isExpanded && "rotate-90",
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div id={panelId} className="px-4 pb-4 pt-0">
                        <p className="text-role-secondary text-muted-foreground break-words">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-role-secondary text-muted-foreground">
                  No results for "{searchQuery}". Try keywords like "reviews" or
                  "privacy".
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpSupportPage;
