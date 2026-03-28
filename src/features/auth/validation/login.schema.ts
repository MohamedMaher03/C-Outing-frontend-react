import { z } from "zod";
import { AUTH_PASSWORD_RULES } from "../constants";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .max(100, "Email must be less than 100 characters")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(
      AUTH_PASSWORD_RULES.MAX_LENGTH,
      `Password must be less than ${AUTH_PASSWORD_RULES.MAX_LENGTH} characters`,
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
