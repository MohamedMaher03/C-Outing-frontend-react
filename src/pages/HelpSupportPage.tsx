import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Book,
  ChevronRight,
  Search,
  ExternalLink,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { cn } from "../libs/utils";

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const contactOptions = [
    {
      icon: MessageCircle,
      label: "Live Chat",
      description: "Chat with our support team",
      action: () => console.log("Open live chat"),
      available: true,
    },
    {
      icon: Mail,
      label: "Email Support",
      description: "support@couting.app",
      action: () => (window.location.href = "mailto:support@couting.app"),
      available: true,
    },
    {
      icon: Phone,
      label: "Phone Support",
      description: "+20 123 456 7890",
      action: () => (window.location.href = "tel:+201234567890"),
      available: false,
    },
  ];

  const faqs = [
    {
      question: "How do I save my favorite places?",
      answer:
        "Tap the heart icon on any place card or detail page to add it to your favorites. You can view all your saved places in the Favorites tab.",
    },
    {
      question: "How are recommendations generated?",
      answer:
        "We use your interests, location preferences, vibe settings, and past activity to suggest places you'll love. Update your preferences in the Profile section for better recommendations.",
    },
    {
      question: "Can I use the app offline?",
      answer:
        "You can view previously loaded content offline, but searching and getting new recommendations requires an internet connection.",
    },
    {
      question: "How do I change my location preferences?",
      answer:
        "Go to Profile > Preferences > Areas, then select or deselect the districts you're interested in exploring.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! We use industry-standard encryption and never share your personal information with third parties without your consent. Visit Privacy & Data settings for more details.",
    },
    {
      question: "How do I report an issue with a venue?",
      answer:
        "On the venue detail page, tap the three dots menu and select 'Report Issue'. You can flag incorrect information, closed venues, or other problems.",
    },
    {
      question: "Can I delete my account?",
      answer:
        "Yes, you can permanently delete your account from Profile > Account > Privacy > Delete Account. This action cannot be undone.",
    },
  ];

  const resources = [
    {
      label: "User Guide",
      description: "Complete guide to using the app",
      icon: Book,
      link: "#",
    },
    {
      label: "Terms of Service",
      description: "Our terms and conditions",
      icon: ExternalLink,
      link: "#",
    },
    {
      label: "Privacy Policy",
      description: "How we protect your data",
      icon: ExternalLink,
      link: "#",
    },
    {
      label: "Community Guidelines",
      description: "Be a good community member",
      icon: ExternalLink,
      link: "#",
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

        {/* Resources */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Resources</h2>
          <div className="space-y-2">
            {resources.map((resource) => (
              <a
                key={resource.label}
                href={resource.link}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <resource.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {resource.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {resource.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
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
