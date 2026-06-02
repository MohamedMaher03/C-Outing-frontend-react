import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n";

interface FormErrorProps {
  message?: string;
  className?: string;
}

const STATIC_MESSAGE_KEYS: Record<string, string> = {
  "Email must be less than 100 characters": "auth.validation.emailMax",
  "Please enter a valid email address": "auth.validation.invalidEmail",
  "Password is required": "auth.validation.passwordRequired",
  "Full name must be at least 2 characters": "auth.validation.fullNameMin",
  "Full name must be less than 100 characters": "auth.validation.fullNameMax",
  "Phone number must be at least 10 characters": "auth.validation.phoneMin",
  "Phone number must be less than 20 characters": "auth.validation.phoneMax",
  "Phone number must include country code (e.g. +201234567890)":
    "auth.validation.phoneFormat",
  "Date of birth is required": "auth.validation.dobRequired",
  "Please enter a valid date": "auth.validation.validDate",
  "You must be at least 13 years old": "auth.validation.minAge",
  "Date of birth cannot be in the future": "auth.validation.dobFuture",
  "Avatar must be an image": "auth.validation.avatarImage",
  "Please confirm your password": "auth.validation.confirmPassword",
  "You must accept the terms and conditions": "auth.validation.acceptTerms",
  "Passwords don't match": "auth.validation.passwordMatch",
  "Passwords do not match": "auth.validation.passwordsNoMatch",
  "Code must contain only digits": "auth.validation.codeDigits",
  "Password must contain at least one uppercase letter, one lowercase letter, and one number":
    "auth.validation.passwordComplexity",
};

type TranslationResolver = {
  predicate: (payload: string) => boolean;
  transformer: (payload: string) => { translationKey: string; variables: Record<string, string> };
};

const dynamicResolvers: ReadonlyArray<TranslationResolver> = [
  {
    predicate: (payload) => /^Password must be less than (\d+) characters$/.test(payload),
    transformer: (payload) => {
      const [, boundary = ""] =
        payload.match(/^Password must be less than (\d+) characters$/) ?? [];
      return { translationKey: "auth.validation.passwordMax", variables: { max: boundary } };
    },
  },
  {
    predicate: (payload) => /^Password must be at least (\d+) characters$/.test(payload),
    transformer: (payload) => {
      const [, boundary = ""] =
        payload.match(/^Password must be at least (\d+) characters$/) ?? [];
      return { translationKey: "auth.validation.passwordMin", variables: { min: boundary } };
    },
  },
  {
    predicate: (payload) => /^Avatar must be smaller than (\d+)MB$/.test(payload),
    transformer: (payload) => {
      const [, boundary = ""] = payload.match(/^Avatar must be smaller than (\d+)MB$/) ?? [];
      return { translationKey: "auth.validation.avatarMax", variables: { max: boundary } };
    },
  },
  {
    predicate: (payload) => /^Code must be exactly (\d+) digits$/.test(payload),
    transformer: (payload) => {
      const [, boundary = ""] = payload.match(/^Code must be exactly (\d+) digits$/) ?? [];
      return { translationKey: "auth.validation.codeLength", variables: { length: boundary } };
    },
  },
];

export const FormError = ({ message, className }: FormErrorProps) => {
  const { t } = useI18n();
  const normalizedMessage = message?.trim();

  if (!normalizedMessage) {
    return null;
  }

  const staticKey = STATIC_MESSAGE_KEYS[normalizedMessage];
  const resolvedStaticMessage = staticKey ? t(staticKey) : normalizedMessage;
  const matchedResolver = dynamicResolvers.find(({ predicate }) =>
    predicate(normalizedMessage),
  );
  const resolvedDynamicMessage = matchedResolver
    ? (() => {
        const { translationKey, variables } =
          matchedResolver.transformer(normalizedMessage);
        return t(translationKey, variables);
      })()
    : undefined;

  const localizedMessage = resolvedDynamicMessage ?? resolvedStaticMessage;

  return (
    <p
      role="alert"
      aria-live="polite"
      className={cn("text-xs text-destructive break-words", className)}
      dir="auto"
    >
      {localizedMessage}
    </p>
  );
};
