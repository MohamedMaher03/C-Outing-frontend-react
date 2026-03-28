import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/LoadingSpinner";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "./form/FormField";
import { useNavigate } from "react-router-dom";
import { AuthShell, AuthSurface } from "./layout/AuthShell";
import { AuthStatusBanner } from "./ui/AuthStatusBanner";

import { loginSchema } from "@/features/auth/validation/login.schema";
import type { LoginFormData } from "@/features/auth/validation/login.schema";
import { PasswordInput } from "./form/PasswordInput";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { LOGIN_FORM_FIELDS } from "@/features/auth/mocks";
import type { LoginField } from "../types";

const LoginForm = () => {
  const navigate = useNavigate();
  const { loginUser, isLoading, error, clearError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await loginUser(data);
    // Navigation is handled by PublicRoute based on user.hasCompletedOnboarding
  };

  return (
    <AuthShell>
      <AuthSurface>
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            Discover the best places Cairo has to offer
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
            Google
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="px-1 text-[11px] tracking-[0.12em] text-muted-foreground/90 sm:text-xs">
            or continue with email
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* API Error Banner */}
        {error && <AuthStatusBanner message={error} onDismiss={clearError} />}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
          aria-busy={isLoading}
        >
          {/* Render form fields using map */}
          {LOGIN_FORM_FIELDS.map((field: LoginField) => (
            <FormField
              key={field.id}
              id={field.id}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type}
              error={errors[field.id]?.message}
              disabled={isLoading}
              register={register(field.id)}
            />
          ))}

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => navigate("/forgot-password")}
                className="-mx-2 inline-flex min-h-11 items-center px-2 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground/90"
              >
                Forgot password?
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

          <Button
            type="submit"
            className="h-11 w-full font-medium shadow-sm hover:bg-primary/95 disabled:opacity-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <InlineLoading size="lg" className="mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="inline-flex min-h-11 items-center font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Create one
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

export default LoginForm;
