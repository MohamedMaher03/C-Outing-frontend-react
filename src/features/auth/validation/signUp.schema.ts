import { z } from "zod";
import { AUTH_AVATAR_RULES, AUTH_PASSWORD_RULES } from "../constants";

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),

    email: z
      .string()
      .trim()
      .max(100, "Email must be less than 100 characters")
      .email("Please enter a valid email address"),

    phone: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 characters")
      .max(20, "Phone number must be less than 20 characters")
      .regex(
        /^\+[0-9]{1,3}[0-9\s\-()]{8,}$/,
        "Phone number must include country code (e.g. +201234567890)",
      ),

    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date")
      .refine((val) => {
        const dob = new Date(val);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        const actualAge =
          age - (m < 0 || (m === 0 && today.getDate() < dob.getDate()) ? 1 : 0);
        return actualAge >= 13;
      }, "You must be at least 13 years old")
      .refine(
        (val) => new Date(val) <= new Date(),
        "Date of birth cannot be in the future",
      ),

    password: z
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

    avatar: z
      .preprocess(
        (value) => {
          if (value instanceof FileList) {
            return value.length > 0 ? value[0] : undefined;
          }
          if (value instanceof File) return value;
          return undefined;
        },
        z.union([z.instanceof(File), z.undefined()]),
      )
      .refine(
        (file) => !file || file.type.startsWith(AUTH_AVATAR_RULES.MIME_PREFIX),
        "Avatar must be an image",
      )
      .refine(
        (file) => !file || file.size <= AUTH_AVATAR_RULES.MAX_SIZE_BYTES,
        `Avatar must be smaller than ${AUTH_AVATAR_RULES.MAX_SIZE_MB}MB`,
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpFormInput = z.input<typeof signUpSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
