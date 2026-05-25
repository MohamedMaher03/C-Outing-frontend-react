import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/features/auth/validation/signUp.schema";
import type { SignUpFormData } from "@/features/auth/validation/signUp.schema";
import type { SignUpFormInput } from "@/features/auth/validation/signUp.schema";
import { PasswordInput } from "./form/PasswordInput";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "./form/FormField";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@/features/auth/hooks/useSignUp";
import { SIGN_UP_FORM_FIELDS } from "@/features/auth/mocks";
import type { SignUpFieldConfig } from "@/features/auth/types";
import { AuthShell, AuthSurface } from "./layout/AuthShell";
import { AuthStatusBanner } from "./ui/AuthStatusBanner";
import { useI18n } from "@/components/i18n";
import {
  COUNTRIES,
  CUSTOM_COUNTRY_VALUE,
  DEFAULT_COUNTRY,
  SIGN_UP_BACKEND_FIELD_MAP,
  normalizePhone,
} from "../../../utils/SignUpForm.constants";

const toSignUpFieldName = (rawField: string) => {
  const normalized = rawField
    .trim()
    .split(".")
    .pop()
    ?.replace(/\[[0-9]+\]/g, "")
    .toLowerCase();

  return normalized ? SIGN_UP_BACKEND_FIELD_MAP[normalized] : undefined;
};

const SignUpForm = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { registerUser, isLoading, error, validationErrors, clearError } =
    useSignUp();
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const activeCountryCode =
    countryCode === CUSTOM_COUNTRY_VALUE ? "" : countryCode;
  const countryLabel = useMemo(() => {
    if (countryCode === CUSTOM_COUNTRY_VALUE)
      return t("auth.phoneCountryOther");
    const match = COUNTRIES.find((country) => country.code === countryCode);
    return match ? match.label : "";
  }, [countryCode, t]);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    reset,
    formState: { errors },
  } = useForm<SignUpFormInput, unknown, SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (!validationErrors) return;

    Object.entries(validationErrors).forEach(([backendField, messages]) => {
      const formField = toSignUpFieldName(backendField);
      const message = messages[0];

      if (!formField || !message) return;
      setError(formField, { type: "server", message });
    });
  }, [setError, validationErrors]);

  const onSubmit = async (data: SignUpFormData) => {
    clearError();
    clearErrors();

    const normalizedPhone = normalizePhone(data.phone, activeCountryCode);
    const success = await registerUser({ ...data, phone: normalizedPhone });
    if (success) {
      reset();
      navigate("/verify-email", { state: { email: data.email } });
    }
  };

  return (
    <AuthShell maxWidth="2xl">
      <AuthSurface>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="-mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground/90"
        >
          <ArrowLeft className="rtl-mirror h-4 w-4" />
          {t("auth.backToLogin")}
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("auth.createAccount")}
          </h2>
          <p className="text-muted-foreground text-sm">{t("auth.joinUs")}</p>
        </div>

        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
          aria-busy={isLoading}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SIGN_UP_FORM_FIELDS.map((field: SignUpFieldConfig) => {
              if (field.id === "phone") {
                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{t("auth.fields.phone")}</Label>

                    <div
                      className={`flex h-11 items-center overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                        errors.phone
                          ? "border-destructive focus-within:ring-destructive"
                          : "border-input"
                      }`}
                    >
                      <label className="sr-only" htmlFor="phone-country">
                        {t("auth.phoneCountryLabel")}
                      </label>
                      <select
                        id="phone-country"
                        value={countryCode}
                        onChange={(event) => setCountryCode(event.target.value)}
                        className="h-11 w-40 shrink-0 border-0 border-r border-input bg-muted/30 px-3 text-sm text-foreground outline-none focus-visible:ring-0"
                        aria-label={`${t("auth.phoneCountryLabel")}: ${countryLabel}`}
                        disabled={isLoading}
                      >
                        {COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.label} {country.code}
                          </option>
                        ))}
                        <option value={CUSTOM_COUNTRY_VALUE}>
                          {t("auth.phoneCountryOther")}
                        </option>
                      </select>

                      <Input
                        id={field.id}
                        type="tel"
                        dir="ltr"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder={
                          countryCode === CUSTOM_COUNTRY_VALUE
                            ? t("auth.placeholders.phoneInternational")
                            : t("auth.placeholders.phoneNational")
                        }
                        {...register("phone")}
                        disabled={isLoading}
                        aria-invalid={!!errors.phone}
                        className="h-11 min-w-0 flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm"
                      />
                    </div>

                    <FormError message={errors.phone?.message} />
                  </div>
                );
              }

              return (
                <FormField
                  key={field.id}
                  id={field.id}
                  label={
                    field.id === "fullName"
                      ? t("auth.fields.fullName")
                      : field.id === "email"
                        ? t("auth.fields.email")
                        : field.id === "dateOfBirth"
                          ? t("auth.fields.dateOfBirth")
                          : field.label
                  }
                  placeholder={
                    field.id === "fullName"
                      ? t("auth.placeholders.fullName")
                      : field.id === "email"
                        ? t("auth.placeholders.email")
                        : field.placeholder
                  }
                  type={field.type}
                  icon={field.Icon && <field.Icon className="h-4 w-4" />}
                  error={errors[field.id]?.message}
                  disabled={isLoading}
                  register={register(field.id)}
                />
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>

            <PasswordInput
              id="password"
              placeholder="••••••••"
              register={register("password")}
              error={!!errors.password}
              disabled={isLoading}
            />

            <FormError message={errors.password?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>

            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              register={register("confirmPassword")}
              error={!!errors.confirmPassword}
              disabled={isLoading}
            />

            <FormError message={errors.confirmPassword?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">{t("auth.avatarOptional")}</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              disabled={isLoading}
              aria-invalid={!!errors.avatar}
              {...register("avatar")}
              className={
                errors.avatar
                  ? "h-11 border-destructive text-base focus-visible:ring-destructive sm:text-sm"
                  : "h-11 text-base sm:text-sm"
              }
            />
            <p className="text-role-micro text-muted-foreground">
              {t("auth.defaultAvatarHint")}
            </p>
            <FormError message={errors.avatar?.message} />
          </div>

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95 disabled:opacity-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <InlineLoading size="lg" />
                {t("auth.creatingAccount")}
              </span>
            ) : (
              t("auth.createAccount")
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.alreadyHaveAccount")}{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex min-h-11 items-center font-semibold text-primary transition-colors hover:text-primary"
          >
            {t("auth.signIn")}
          </button>
        </p>
      </AuthSurface>

      <p className="mt-4 pb-2 text-center text-sm text-cream/75 sm:mt-6 sm:pb-0">
        {t("auth.footer")}
      </p>
    </AuthShell>
  );
};

export default SignUpForm;
