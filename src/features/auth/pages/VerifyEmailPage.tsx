import { ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import {
  AuthShell,
  AuthSurface,
} from "@/features/auth/components/layout/AuthShell";
import { AuthStatusBanner } from "@/features/auth/components/ui/AuthStatusBanner";
import { useVerifyEmailPage } from "@/features/auth/hooks/useVerifyEmailPage";
import { otpDigitCellClassName } from "@/features/auth/utils/otpDigitInput";

const VerifyEmailHelpPanel = ({ t }: { t: (key: string) => string }) => (
  <div className="space-y-2 rounded-xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
    <p className="font-medium text-foreground">{t("auth.verify.help.title")}</p>
    <p>{t("auth.verify.help.step1")}</p>
    <p>{t("auth.verify.help.step2")}</p>
    <p>{t("auth.verify.help.step3")}</p>
  </div>
);

export default function VerifyEmailPage() {
  const {
    t,
    formatNumber,
    digits,
    otpLength,
    otpComplete,
    assignInputRef,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    isLoading,
    isResending,
    error,
    clearError,
    hasEmailContext,
    emailEntry,
    emailEntryError,
    resendCountdown,
    successMessage,
    maskedEmailForDisplay,
    canResendVerification,
    submitOtpVerification,
    resendVerificationCode,
    startEmailRecovery,
    updateEmailEntry,
    goToLogin,
    goToRegister,
  } = useVerifyEmailPage();

  if (!hasEmailContext) {
    return (
      <AuthShell>
        <AuthSurface>
          <button
            type="button"
            onClick={goToLogin}
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
              onChange={(event) => updateEmailEntry(event.target.value)}
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
            onClick={() => void startEmailRecovery()}
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

          <VerifyEmailHelpPanel t={t} />
        </AuthSurface>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthSurface>
        <button
          type="button"
          onClick={goToRegister}
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
              email: maskedEmailForDisplay,
            })}
          </p>
        </div>

        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        {successMessage && (
          <AuthStatusBanner message={successMessage} variant="success" />
        )}

        <form
          onSubmit={submitOtpVerification}
          className="space-y-6"
          noValidate
          aria-busy={isLoading}
        >
          <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={assignInputRef(index)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                autoFocus={index === 0}
                aria-label={t("auth.otpDigit", {
                  current: index + 1,
                  total: otpLength,
                })}
                onChange={(event) =>
                  handleDigitChange(index, event.target.value)
                }
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className={otpDigitCellClassName(Boolean(digit), isLoading)}
                disabled={isLoading}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full font-medium shadow-sm hover:bg-primary/95"
            disabled={!otpComplete || isLoading}
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
          {canResendVerification ? (
            <button
              type="button"
              onClick={resendVerificationCode}
              disabled={isResending}
              className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-medium text-secondary transition-colors hover:text-secondary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:text-primary dark:hover:text-primary/90"
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
            <p className="text-sm font-medium text-secondary dark:text-primary">
              {t("auth.verify.resendIn", {
                seconds: formatNumber(resendCountdown),
              })}
            </p>
          )}
        </div>

        <VerifyEmailHelpPanel t={t} />
      </AuthSurface>
    </AuthShell>
  );
}
