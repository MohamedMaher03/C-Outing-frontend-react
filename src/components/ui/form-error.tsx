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

export const FormError = ({ message, className }: FormErrorProps) => {
  const { t } = useI18n();

  if (!message) return null;

  const staticKey = STATIC_MESSAGE_KEYS[message];
  let localizedMessage = staticKey ? t(staticKey) : message;

  const passwordMaxMatch = message.match(
    /^Password must be less than (\d+) characters$/,
  );
  if (passwordMaxMatch) {
    localizedMessage = t("auth.validation.passwordMax", {
      max: passwordMaxMatch[1],
    });
  }

  const passwordMinMatch = message.match(
    /^Password must be at least (\d+) characters$/,
  );
  if (passwordMinMatch) {
    localizedMessage = t("auth.validation.passwordMin", {
      min: passwordMinMatch[1],
    });
  }

  const avatarMaxMatch = message.match(/^Avatar must be smaller than (\d+)MB$/);
  if (avatarMaxMatch) {
    localizedMessage = t("auth.validation.avatarMax", {
      max: avatarMaxMatch[1],
    });
  }

  const codeLengthMatch = message.match(/^Code must be exactly (\d+) digits$/);
  if (codeLengthMatch) {
    localizedMessage = t("auth.validation.codeLength", {
      length: codeLengthMatch[1],
    });
  }

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
