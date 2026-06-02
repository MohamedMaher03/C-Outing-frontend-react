import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "./form/FormField";
import { AuthShell, AuthSurface } from "./layout/AuthShell";
import { AuthStatusBanner } from "./ui/AuthStatusBanner";
import { PasswordInput } from "./form/PasswordInput";
import { useLoginPage } from "@/features/auth/hooks/useLoginPage";
import { LOGIN_FORM_FIELDS } from "@/features/auth/mocks";
import type { LoginField } from "../types";

const LoginForm = () => {
  const {
    t,
    form,
    isLoading,
    isResendingVerification,
    pendingVerificationEmail,
    error,
    clearError,
    recoveryEmail,
    hasRecoveryEmail,
    verificationHint,
    submitCredentials,
    openVerificationFlow,
    resendVerificationCode,
    goToForgotPassword,
    goToRegister,
  } = useLoginPage();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  return (
    <AuthShell>
      <AuthSurface>
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("auth.welcomeBack")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.discoverCairo")}
          </p>
        </div>

        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        {pendingVerificationEmail && (
          <div className="space-y-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {t("auth.login.verifyGuide.title")}
            </p>
            <p className="text-muted-foreground">
              {t("auth.login.verifyGuide.subtitle", {
                email: recoveryEmail,
              })}
            </p>

            <ol className="space-y-1 text-muted-foreground">
              <li>{t("auth.login.verifyGuide.step1")}</li>
              <li>{t("auth.login.verifyGuide.step2")}</li>
              <li>{t("auth.login.verifyGuide.step3")}</li>
            </ol>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                size="sm"
                className="h-10"
                disabled={!hasRecoveryEmail || isLoading}
                onClick={openVerificationFlow}
              >
                {t("auth.login.verifyGuide.continueAction")}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10"
                disabled={
                  !hasRecoveryEmail || isLoading || isResendingVerification
                }
                onClick={resendVerificationCode}
              >
                {isResendingVerification ? (
                  <span className="inline-flex items-center gap-2">
                    <InlineLoading />
                    {t("auth.login.verifyGuide.sending")}
                  </span>
                ) : (
                  t("auth.login.verifyGuide.resendAction")
                )}
              </Button>
            </div>

            {verificationHint && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {verificationHint}
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit(submitCredentials)}
          className="space-y-4"
          noValidate
          aria-busy={isLoading}
        >
          {LOGIN_FORM_FIELDS.map((field: LoginField) => (
            <FormField
              key={field.id}
              id={field.id}
              label={
                field.id === "email" ? t("auth.fields.email") : field.label
              }
              placeholder={
                field.id === "email"
                  ? t("auth.placeholders.email")
                  : field.placeholder
              }
              type={field.type}
              error={errors[field.id]?.message}
              disabled={isLoading}
              register={register(field.id)}
            />
          ))}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <button
                type="button"
                disabled={isLoading}
                onClick={goToForgotPassword}
                className="-mx-2 inline-flex min-h-11 items-center px-2 text-sm font-semibold text-primary transition-colors hover:text-primary/90"
              >
                {t("auth.forgotPassword")}
              </button>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              register={register("password")}
              error={!!errors.password}
              disabled={isLoading}
            />
            <FormError message={errors.password?.message} />
          </div>

          <Controller
            control={control}
            name="staySignedIn"
            render={({ field }) => (
              <label
                htmlFor="staySignedIn"
                className={`group flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40 has-[:focus-visible]:bg-muted/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 motion-reduce:transition-none ${
                  isLoading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <Checkbox
                  id="staySignedIn"
                  checked={field.value ?? false}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  disabled={isLoading}
                  className="h-5 w-5 shrink-0 rounded-md"
                />
                <span className="text-sm font-medium leading-snug text-foreground">
                  {t("auth.keepSignedIn")}
                </span>
              </label>
            )}
          />

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95 disabled:opacity-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <InlineLoading size="lg" />
                {t("auth.signingIn")}
              </span>
            ) : (
              t("auth.signIn")
            )}
          </Button>
        </form>

        <p className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted-foreground">
          <span>{t("auth.noAccount")}</span>
          <button
            type="button"
            onClick={goToRegister}
            className="inline-flex min-h-11 items-center px-1.5 font-semibold text-primary transition-colors hover:text-primary"
          >
            {t("auth.createOne")}
          </button>
        </p>
      </AuthSurface>

      <p className="mt-4 pb-2 text-center text-sm text-cream/75 sm:mt-6 sm:pb-0">
        {t("auth.footer")}
      </p>
    </AuthShell>
  );
};

export default LoginForm;
