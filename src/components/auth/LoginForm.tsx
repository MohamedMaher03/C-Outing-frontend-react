import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FormError } from "../ui/form-error";
import { FormField } from "../form/FormField";
import logo from "../../assets/images/logo3.png";
import cairoBg from "../../assets/images/cairo-bg.jpg";
import { useNavigate } from "react-router-dom";

import { loginSchema } from "../../validation/logIn.schema";
import type { LoginFormData } from "../../validation/logIn.schema";
import { PasswordInput } from "../form/PasswordInput";
import { useLogin } from "../../hooks/useLogin";

interface LoginField {
  id: keyof LoginFormData;
  label: string;
  placeholder: string;
  type?: string;
}

const loginFormFields: LoginField[] = [
  {
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
  },
];

const LoginForm = () => {
  const navigate = useNavigate();
  const { loginUser, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cairoBg})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-primary/70" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src={logo}
            alt="C-Outing Logo"
            className="h-12 w-auto rounded-lg"
          />
          <h1 className="text-3xl font-bold tracking-tight text-cream">
            C-OUTING
          </h1>
        </div>

        {/* Glass Card */}
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm">
              Discover the best places Cairo has to offer
            </p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              className="w-full gap-2 font-medium"
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
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(loginUser)} className="space-y-4">
            {/* Render form fields using map */}
            {loginFormFields.map((field) => (
              <FormField
                key={field.id}
                id={field.id}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                error={errors[field.id]?.message}
                register={register(field.id)}
              />
            ))}

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                register={register("password")}
                error={!!errors.password}
              />
              <FormError message={errors.password?.message} />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-navy-light font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              className="text-secondary font-semibold hover:text-secondary/80 transition-colors"
            >
              Create one
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-cream/50 mt-6">
          © 2026 C-Outing. Explore Cairo like never before.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
