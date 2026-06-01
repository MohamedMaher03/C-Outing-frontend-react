import { Controller } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import {
  AuthShell,
  AuthSurface,
} from "@/features/auth/components/layout/AuthShell";
import { AuthStatusBanner } from "@/features/auth/components/ui/AuthStatusBanner";
import { useResetPasswordPage } from "@/features/auth/hooks/useResetPasswordPage";
import { otpDigitCellClassName } from "@/features/auth/utils/otpDigitInput";

export default function ResetPasswordPage() {
  const {
    t,
    form,
    digits,
    otpLength,
    otpComplete,
    assignInputRef,
    handleDigitChange,
    handleKeyDown,
    handlePaste,
    isLoading,
    error,
    clearError,
    maskedEmailForDisplay,
    requiresEmailRedirect,
    resetSucceeded,
    showNewPassword,
    showConfirmPassword,
    submitPasswordReset,
    requestFreshOtp,
    goToForgotPassword,
    goToLogin,
    toggleNewPasswordVisibility,
    toggleConfirmPasswordVisibility,
  } = useResetPasswordPage();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  if (requiresEmailRedirect) {
    return <Navigate to="/forgot-password" replace />;
  }

  if (resetSucceeded) {
    return (
      <AuthShell>
        <AuthSurface className="text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-600/12 p-3.5">
              <CheckCircle2 className="h-9 w-9 text-green-700 dark:text-green-300" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground" role="status">
            {t("auth.reset.successTitle")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("auth.reset.successBody")}
          </p>
          <Button
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95"
            onClick={goToLogin}
          >
            {t("auth.backToLogin")}
          </Button>
        </AuthSurface>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthSurface>
        <button
          type="button"
          onClick={goToForgotPassword}
          className="-mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground/90"
        >
          <ArrowLeft className="rtl-mirror h-4 w-4" />
          {t("auth.back")}
        </button>

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/15 p-3.5">
              <KeyRound className="h-7 w-7 text-accent/85" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            {t("auth.reset.title")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t("auth.reset.subtitle", {
              email: maskedEmailForDisplay,
            })}
          </p>
        </div>

        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        <form
          onSubmit={handleSubmit(submitPasswordReset)}
          className="space-y-5"
          noValidate
          aria-busy={isLoading}
        >
          <input type="hidden" {...register("email")} />

          <div className="space-y-2">
            <Label>{t("auth.reset.codeLabel")}</Label>
            <Controller
              name="otp"
              control={control}
              render={() => (
                <div className="flex justify-center gap-1.5 sm:gap-2" dir="ltr">
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
              )}
            />
            <FormError message={errors.otp?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("auth.reset.newPassword")}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                dir="ltr"
                placeholder={t("auth.reset.minChars")}
                disabled={isLoading}
                aria-invalid={!!errors.newPassword}
                className={`h-11 pr-10 text-base sm:text-sm ${errors.newPassword ? "border-destructive" : ""}`}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={toggleNewPasswordVisibility}
                disabled={isLoading}
                aria-label={
                  showNewPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
                aria-pressed={showNewPassword}
                className="absolute top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                style={{ insetInlineEnd: "0.25rem" }}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FormError message={errors.newPassword?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("auth.reset.confirmPassword")}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                dir="ltr"
                placeholder={t("auth.reset.repeatPassword")}
                disabled={isLoading}
                aria-invalid={!!errors.confirmPassword}
                className={`h-11 pr-10 text-base sm:text-sm ${errors.confirmPassword ? "border-destructive" : ""}`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                disabled={isLoading}
                aria-label={
                  showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
                aria-pressed={showConfirmPassword}
                className="absolute top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                style={{ insetInlineEnd: "0.25rem" }}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <FormError message={errors.confirmPassword?.message} />
          </div>

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95"
            disabled={isLoading || !otpComplete}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <InlineLoading size="lg" />
                {t("auth.reset.submitting")}
              </span>
            ) : (
              t("auth.reset.submit")
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.reset.noCode")}{" "}
          <button
            type="button"
            onClick={requestFreshOtp}
            className="inline-flex min-h-11 items-center px-1 font-medium text-foreground/80 transition-colors hover:text-foreground"
            disabled={isLoading}
          >
            {t("auth.reset.requestNew")}
          </button>
        </p>
      </AuthSurface>
    </AuthShell>
  );
}
