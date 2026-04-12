import { z } from "zod";
import { AUTH_OTP_LENGTH, AUTH_PASSWORD_RULES } from "../constants";

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .max(100, "Email must be less than 100 characters")
      .email("Please enter a valid email address"),
    otp: z
      .string()
      .length(AUTH_OTP_LENGTH, `Code must be exactly ${AUTH_OTP_LENGTH} digits`)
      .regex(
        new RegExp(`^\\d{${AUTH_OTP_LENGTH}}$`),
        "Code must contain only digits",
      ),
    newPassword: z
      .string()
      .min(
        AUTH_PASSWORD_RULES.MIN_LENGTH,
        `Password must be at least ${AUTH_PASSWORD_RULES.MIN_LENGTH} characters`,
      )
      .max(
        AUTH_PASSWORD_RULES.MAX_LENGTH,
        `Password must be less than ${AUTH_PASSWORD_RULES.MAX_LENGTH} characters`,
      )
      .regex(
        AUTH_PASSWORD_RULES.COMPLEXITY_REGEX,
        AUTH_PASSWORD_RULES.COMPLEXITY_MESSAGE,
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
