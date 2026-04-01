import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { AUTH_OTP_LENGTH } from "@/features/auth/constants";
import {
  AuthShell,
  AuthSurface,
} from "@/features/auth/components/layout/AuthShell";
import { AuthStatusBanner } from "@/features/auth/components/ui/AuthStatusBanner";
import { useI18n } from "@/components/i18n";

const OTP_LENGTH = AUTH_OTP_LENGTH;
const RESEND_COOLDOWN_SECONDS = 60;

/** Masks an email address: john.doe@example.com → j*****e@example.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export default function VerifyEmailPage() {
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const { verifyOtp, resendOtp, isLoading, isResending, error, clearError } =
    useVerifyEmail();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const successTimeoutRef = useRef<number | null>(null);

  // Redirect to register if there's no email in route state
  if (!email) return <Navigate to="/register" replace />;

  // Countdown timer for resend button
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // Cleanup pending success banner timeout on unmount.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(
    () => () => {
      if (successTimeoutRef.current !== null) {
        window.clearTimeout(successTimeoutRef.current);
      }
    },
    [],
  );

  const handleDigitChange = (index: number, raw: string) => {
    // Handle paste of full OTP into any box
    const pasted = raw.replace(/\D/g, "");
    if (pasted.length > 1) {
      const next = [...digits];
      pasted
        .split("")
        .slice(0, OTP_LENGTH)
        .forEach((d, i) => {
          if (index + i < OTP_LENGTH) next[index + i] = d;
        });
      setDigits(next);
      const focusIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    if (!/^\d?$/.test(raw)) return;
    const next = [...digits];
    next[index] = raw;
    setDigits(next);
    if (raw && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    text
      .split("")
      .slice(0, OTP_LENGTH)
      .forEach((d, i) => (next[i] = d));
    setDigits(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const otp = digits.join("");
  const isComplete = otp.length === OTP_LENGTH && digits.every((d) => d !== "");
  const maskedEmail = `\u2068${maskEmail(email)}\u2069`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isLoading) return;
    clearError();
    const success = await verifyOtp(email, otp);
    if (success) navigate("/onboarding", { replace: true });
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    clearError();
    const success = await resendOtp(email);
    if (success) {
      setCountdown(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
      setDigits(Array(OTP_LENGTH).fill(""));
      setSuccessMessage(t("auth.verify.newCodeSent"));
      inputRefs.current[0]?.focus();
      if (successTimeoutRef.current !== null) {
        window.clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = window.setTimeout(
        () => setSuccessMessage(null),
        4000,
      );
    }
  };

  return (
    <AuthShell>
      <AuthSurface>
        {/* Back to Register */}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="-mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground/90"
        >
          <ArrowLeft className="rtl-mirror h-4 w-4" />
          {t("auth.backToRegister")}
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/15 p-3.5">
              <Mail className="h-7 w-7 text-accent/85" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            {t("auth.verify.title")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("auth.verify.subtitle", {
              email: maskedEmail,
            })}
          </p>
        </div>

        {/* Error Banner */}
        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        {/* Success Banner */}
        {successMessage && (
          <AuthStatusBanner message={successMessage} variant="success" />
        )}

        {/* OTP Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
          aria-busy={isLoading}
        >
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoFocus={index === 0}
                aria-label={t("auth.otpDigit", {
                  current: index + 1,
                  total: OTP_LENGTH,
                })}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={[
                  "h-12 w-10 rounded-lg border text-center text-lg font-semibold sm:w-11",
                  "bg-background/70 text-foreground",
                  "transition-colors duration-200 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/40",
                  digit
                    ? "border-primary/45 bg-primary/10"
                    : "border-border/70",
                  isLoading ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full font-medium shadow-sm hover:bg-primary/95"
            disabled={!isComplete || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <InlineLoading />
                {t("auth.verify.submitting")}
              </span>
            ) : (
              t("auth.verify.submit")
            )}
          </Button>
        </form>

        {/* Resend Section */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t("auth.verify.noCode")}
          </p>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <InlineLoading />
                  {t("auth.verify.sending")}
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("auth.verify.resend")}
                </>
              )}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("auth.verify.resendIn", {
                seconds: formatNumber(countdown),
              })}
            </p>
          )}
        </div>
      </AuthSurface>
    </AuthShell>
  );
}
