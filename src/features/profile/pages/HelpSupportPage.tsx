import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const contactOptions = [
    {
      icon: Mail,
      label: "Email Support",
      description: "farouqdiaaeldin@gmail.com",
      action: () => (window.location.href = "mailto:farouqdiaaeldin@gmail.com"),
      available: true,
    },
  ];

  const faqs = [
    {
      question: "How do personalized recommendations work?",
      answer:
        "Recommendations are generated from your onboarding preferences, selected vibe, districts, and your activity such as saved places and reviews.",
    },
    {
      question: "How can I change my interests, vibe, budget, or districts?",
      answer:
        "Open Profile and go to Preferences, then update your interests, vibe slider, budget level, and preferred districts. Your future recommendations update based on these changes.",
    },
    {
      question: "How do I save and manage favorite places?",
      answer:
        "Tap the save or heart action on a place to add it to Favorites. You can remove it any time from the Favorites screen or directly from the place card.",
    },
    {
      question: "How do I write or edit my review for a place?",
      answer:
        "Open the place details page and submit a review with your rating and comment. If you already reviewed that place, use the edit option on your review.",
    },
    {
      question: "How can I control my notifications?",
      answer:
        "Go to Profile > Notifications to enable or disable push and email updates such as recommendation alerts, favorite updates, review responses, and monthly digest emails.",
    },
    {
      question: "What privacy settings can I change?",
      answer:
        "In Profile > Privacy & Data, you can choose whether your favorites and activity are visible, and whether data collection and personalization are enabled.",
    },
    {
      question: "How do I delete my account?",
      answer:
        "Go to Profile > Privacy & Data and choose Delete Account. This action is permanent and removes your profile data, favorites, and preferences.",
    },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs;

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-secondary" />
            <h1 className="text-xl font-bold text-foreground">
              Help & Support
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Contact Support */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Contact Support
          </h2>
          <div className="grid gap-3">
            {contactOptions.map((option) => (
              <button
                key={option.label}
                onClick={option.action}
                disabled={!option.available}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl bg-card border border-border transition-colors",
                  option.available
                    ? "hover:bg-muted/50"
                    : "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <option.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {option.label}
                      {!option.available && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Coming Soon)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                {option.available && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="pl-10"
            />
          </div>

          {/* FAQ Items */}
          <div className="space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-card border border-border overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground text-left">
                      {faq.question}
                    </p>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        expandedFaq === index && "rotate-90",
                      )}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-sm text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No FAQs found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">C-Outing App v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
