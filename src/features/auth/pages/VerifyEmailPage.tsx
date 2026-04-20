import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
  type FormEvent,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { AUTH_OTP_LENGTH } from "@/features/auth/constants";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  AuthShell,
  AuthSurface,
} from "@/features/auth/components/layout/AuthShell";
import { AuthStatusBanner } from "@/features/auth/components/ui/AuthStatusBanner";
import { useI18n } from "@/components/i18n";
import { normalizeEmail } from "@/utils/textNormalization";

const OTP_LENGTH = AUTH_OTP_LENGTH;
const RESEND_COOLDOWN_SECONDS = 60;
const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

const isValidEmail = (value: string): boolean =>
  SIMPLE_EMAIL_PATTERN.test(normalizeEmail(value));

export default function VerifyEmailPage() {
  const { t, formatNumber } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    pendingVerificationEmail,
    setPendingVerificationEmail,
    clearPendingVerificationEmail,
  } = useAuth();

  const routeStateEmail = normalizeEmail(
    (location.state as { email?: string } | null)?.email ?? "",
  );
  const queryEmail = normalizeEmail(
    new URLSearchParams(location.search).get("email") ?? "",
  );
  const email = routeStateEmail || queryEmail || pendingVerificationEmail || "";
  const hasEmailContext = email.length > 0;

  const { verifyOtp, resendOtp, isLoading, isResending, error, clearError } =
    useVerifyEmail();

  const [emailEntry, setEmailEntry] = useState(email);
  const [emailEntryError, setEmailEntryError] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const successTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasEmailContext) return;
    setPendingVerificationEmail(email);
  }, [email, hasEmailContext, setPendingVerificationEmail]);

  useEffect(() => {
    if (!hasEmailContext) return;

    if (countdown <= 0) return;

    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, hasEmailContext]);

  useEffect(
    () => () => {
      if (successTimeoutRef.current !== null) {
        window.clearTimeout(successTimeoutRef.current);
      }
    },
    [],
  );

  const handleDigitChange = (index: number, raw: string) => {
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
  const maskedEmail = hasEmailContext ? `\u2068${maskEmail(email)}\u2069` : "";
  const canResend = countdown <= 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasEmailContext || !isComplete || isLoading) return;
    clearError();
    const success = await verifyOtp(email, otp);
    if (success) {
      clearPendingVerificationEmail();
      navigate("/onboarding", { replace: true });
    }
  };

  const handleResend = async () => {
    if (!hasEmailContext || !canResend || isResending) return;

    clearError();
    const success = await resendOtp(email);
    if (success) {
      setPendingVerificationEmail(email);
      setCountdown(RESEND_COOLDOWN_SECONDS);
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

  const handleStartRecovery = async () => {
    const normalizedEmail = normalizeEmail(emailEntry);

    if (!isValidEmail(normalizedEmail)) {
      setEmailEntryError(t("auth.validation.invalidEmail"));
      return;
    }

    setEmailEntryError(null);
    clearError();

    const success = await resendOtp(normalizedEmail);
    if (!success) return;

    setPendingVerificationEmail(normalizedEmail);
    setSuccessMessage(t("auth.verify.recovery.codeSent"));
    setCountdown(RESEND_COOLDOWN_SECONDS);

    navigate(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`, {
      replace: true,
      state: { email: normalizedEmail },
    });
  };

  if (!hasEmailContext) {
    return (
      <AuthShell>
        <AuthSurface>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="-mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground/90"
          >
            <ArrowLeft className="rtl-mirror h-4 w-4" />
            {t("auth.backToLogin")}
          </button>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-accent/15 p-3.5">
                <Mail className="h-7 w-7 text-accent/85" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              {t("auth.verify.recovery.title")}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("auth.verify.recovery.subtitle")}
            </p>
          </div>

          {error && <AuthStatusBanner message={error} onDismiss={clearError} />}
          {successMessage && (
            <AuthStatusBanner message={successMessage} variant="success" />
          )}

          <div className="space-y-2">
            <label
              htmlFor="verify-recovery-email"
              className="text-sm font-medium"
            >
              {t("auth.verify.recovery.emailLabel")}
            </label>
            <Input
              id="verify-recovery-email"
              type="email"
              value={emailEntry}
              onChange={(event) => {
                setEmailEntry(event.target.value);
                if (emailEntryError) setEmailEntryError(null);
              }}
              placeholder={t("auth.placeholders.email")}
              disabled={isResending}
              autoComplete="email"
            />
            {emailEntryError && (
              <p className="text-sm text-destructive" role="alert">
                {emailEntryError}
              </p>
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={isResending}
            onClick={() => {
              void handleStartRecovery();
            }}
          >
            {isResending ? (
              <span className="inline-flex items-center gap-2">
                <InlineLoading />
                {t("auth.verify.recovery.sending")}
              </span>
            ) : (
              t("auth.verify.recovery.sendCode")
            )}
          </Button>

          <div className="space-y-2 rounded-xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {t("auth.verify.help.title")}
            </p>
            <p>{t("auth.verify.help.step1")}</p>
            <p>{t("auth.verify.help.step2")}</p>
            <p>{t("auth.verify.help.step3")}</p>
          </div>
        </AuthSurface>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthSurface>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="-mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground/90"
        >
          <ArrowLeft className="rtl-mirror h-4 w-4" />
          {t("auth.backToRegister")}
        </button>

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

        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        {successMessage && (
          <AuthStatusBanner message={successMessage} variant="success" />
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
          aria-busy={isLoading}
        >
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

        <div className="space-y-2 rounded-xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {t("auth.verify.help.title")}
          </p>
          <p>{t("auth.verify.help.step1")}</p>
          <p>{t("auth.verify.help.step2")}</p>
          <p>{t("auth.verify.help.step3")}</p>
        </div>
      </AuthSurface>
    </AuthShell>
  );
}
