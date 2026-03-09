import { z } from "zod";

export const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must contain only digits"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
