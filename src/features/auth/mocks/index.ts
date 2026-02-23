/**
 * Auth Feature — Form Field Constants
 */

import { User, Mail, Phone } from "lucide-react";
import type { LoginField, SignUpFieldConfig } from "../types";

/** Field definitions for the login form */
export const LOGIN_FORM_FIELDS: LoginField[] = [
  {
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
  },
];

/** Field definitions for the sign-up form (Icon is a component reference) */
export const SIGN_UP_FORM_FIELDS: SignUpFieldConfig[] = [
  {
    id: "fullName",
    label: "Full Name",
    placeholder: "John Doe",
    type: "text",
    Icon: User,
  },
  {
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
    Icon: Mail,
  },
  {
    id: "phone",
    label: "Phone Number",
    placeholder: "+20 123 456 7890",
    type: "tel",
    Icon: Phone,
  },
];
