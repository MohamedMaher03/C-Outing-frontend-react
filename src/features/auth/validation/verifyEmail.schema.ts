import { z } from "zod";
import { AUTH_OTP_LENGTH } from "../constants";

export const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(AUTH_OTP_LENGTH, `Code must be exactly ${AUTH_OTP_LENGTH} digits`)
    .regex(
      new RegExp(`^\\d{${AUTH_OTP_LENGTH}}$`),
      "Code must contain only digits",
    ),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
