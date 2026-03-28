import { useEffect } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "./form/FormField";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@/features/auth/hooks/useSignUp";
import { SIGN_UP_FORM_FIELDS } from "@/features/auth/mocks";
import type { SignUpFieldConfig } from "@/features/auth/types";
import { AuthShell, AuthSurface } from "./layout/AuthShell";
import { AuthStatusBanner } from "./ui/AuthStatusBanner";

const SIGN_UP_BACKEND_FIELD_MAP: Record<string, FieldPath<SignUpFormInput>> = {
  name: "fullName",
  fullname: "fullName",
  email: "email",
  phone: "phone",
  phonenumber: "phone",
  dateofbirth: "dateOfBirth",
  password: "password",
  confirmpassword: "confirmPassword",
  avatar: "avatar",
  acceptterms: "acceptTerms",
};

const toSignUpFieldName = (
  rawField: string,
): FieldPath<SignUpFormInput> | undefined => {
  const normalized = rawField
    .trim()
    .split(".")
    .pop()
    ?.replace(/\[[0-9]+\]/g, "")
    .toLowerCase();

  return normalized ? SIGN_UP_BACKEND_FIELD_MAP[normalized] : undefined;
};

const SignUpForm = () => {
  const navigate = useNavigate();
  const { registerUser, isLoading, error, validationErrors, clearError } =
    useSignUp();

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    reset,
    formState: { errors },
    control,
  } = useForm<SignUpFormInput, unknown, SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      acceptTerms: false,
    },
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

    const success = await registerUser(data);
    if (success) {
      reset();
      navigate("/verify-email", { state: { email: data.email } });
    }
  };

  return (
    <AuthShell maxWidth="2xl">
      <AuthSurface>
        {/* Back to Login Link */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="-mx-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            Create Account
          </h2>
          <p className="text-muted-foreground text-sm">
            Join us and discover the best places Cairo has to offer
          </p>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            className="w-full gap-2 font-normal text-foreground/85"
            type="button"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="px-1 text-[11px] tracking-[0.12em] text-muted-foreground/90 sm:text-xs">
            or continue with email
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* API Error Banner */}
        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
          aria-busy={isLoading}
        >
          {/* Render form fields using map */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SIGN_UP_FORM_FIELDS.map((field: SignUpFieldConfig) => (
              <FormField
                key={field.id}
                id={field.id}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                icon={field.Icon && <field.Icon className="h-4 w-4" />}
                error={errors[field.id]?.message}
                disabled={isLoading}
                register={register(field.id)}
              />
            ))}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <PasswordInput
              id="password"
              placeholder="••••••••"
              register={register("password")}
              error={!!errors.password}
              disabled={isLoading}
            />

            <FormError message={errors.password?.message} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>

            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              register={register("confirmPassword")}
              error={!!errors.confirmPassword}
              disabled={isLoading}
            />

            <FormError message={errors.confirmPassword?.message} />
          </div>

          {/* Avatar (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar (Optional)</Label>
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
            <p className="text-xs text-muted-foreground">
              If you skip this, we will upload a default avatar for your
              account.
            </p>
            <FormError message={errors.avatar?.message} />
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Controller
                name="acceptTerms"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                )}
              />

              <div className="flex-1">
                <Label
                  htmlFor="acceptTerms"
                  className="text-sm font-normal cursor-pointer"
                >
                  I accept the{" "}
                  <button
                    type="button"
                    disabled={isLoading}
                    className="inline-flex min-h-11 items-center font-medium text-foreground/80 transition-colors hover:text-foreground"
                  >
                    Terms and Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    disabled={isLoading}
                    className="inline-flex min-h-11 items-center font-medium text-foreground/80 transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </button>
                </Label>
              </div>
            </div>
            <FormError message={errors.acceptTerms?.message} />
          </div>

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95 disabled:opacity-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <InlineLoading size="lg" className="mr-2" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex min-h-11 items-center font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Sign in
          </button>
        </p>
      </AuthSurface>

      {/* Footer */}
      <p className="mt-4 pb-2 text-center text-xs text-cream/60 sm:mt-6 sm:pb-0">
        © 2026 C-Outing. Explore Cairo like never before.
      </p>
    </AuthShell>
  );
};

export default SignUpForm;
