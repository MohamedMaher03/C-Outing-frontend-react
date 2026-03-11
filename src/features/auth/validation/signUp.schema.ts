import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be less than 50 characters"),

    email: z.string().trim().email("Please enter a valid email address"),

    phone: z
      .string()
      .trim()
      .regex(
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        "Please enter a valid phone number",
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
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
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

export type SignUpFormData = z.infer<typeof signUpSchema>;
