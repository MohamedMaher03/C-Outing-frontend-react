# Authentication Components

This directory contains all authentication-related components for the C-Outing application.

## Components

### LoginForm ✅

A full-page login component with:

- Email and password fields with validation
- Password visibility toggle
- Google OAuth integration
- Forgot password link
- Link to sign-up page
- Glassmorphism design with Cairo background

**Route:** `/login`

**Features:**

- Form validation using Zod and React Hook Form
- Loading states during authentication
- Responsive design
- Navy blue and gold/champagne color scheme

### SignUpForm ✅

A comprehensive registration component with:

- Full name, email, phone, password, and confirm password fields
- Password strength validation
- Terms and conditions checkbox
- Back to login link
- Google OAuth integration
- Matches the login page design aesthetic

**Route:** `/register`

**Features:**

- Advanced form validation:
  - Full name: 2-50 characters
  - Email: Valid email format
  - Phone: International phone number format
  - Password: Minimum 8 characters with uppercase, lowercase, and number
  - Password confirmation matching
  - Required terms acceptance
- Real-time validation feedback
- Password visibility toggles
- Loading states during registration
- Icon indicators for input fields (User, Mail, Phone)
- Responsive design with glassmorphism

## Form Validation Rules

**SignUp Schema:**

```typescript
- Full Name: 2-50 characters, trimmed
- Email: Valid email format
- Phone: International format (e.g., +20 123 456 7890)
- Password:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Confirm Password: Must match password
- Terms: Must be accepted
```

**Login Schema:**

```typescript
- Email: Valid email format
- Password: Minimum 6 characters
```

## Design System

### Colors

- **Navy Blue:** `#1A365D` (--primary)
- **Gold/Champagne:** `hsl(38, 42%, 58%)` (--secondary)
- **Cream:** `hsl(40, 30%, 95%)` (--cream)

### Typography

- **Font Family:** Plus Jakarta Sans
- **Headings:** Bold, Navy Blue
- **Body:** Regular, Muted Foreground

### Components Used

- Shadcn UI components (Button, Input, Label, Checkbox)
- Lucide React icons (Eye, EyeOff, User, Mail, Phone, ArrowLeft)
- React Hook Form for form management
- Zod for schema validation

## Navigation Flow

```
Login Page (/login)
    ↓ "Create one" link
Sign-Up Page (/register)
    ↓ "Sign in" link or "Back to Login"
Login Page (/login)
    ↓ Successful authentication
Recommendations Page (/recommendations)
```

## Usage Example

```tsx
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';

// In route configuration
<Route path="/login" element={<LoginForm />} />
<Route path="/register" element={<SignUpForm />} />
```

## Planned Components

- **ProtectedRoute** - Route guard for authenticated pages (see `/routes/index.tsx`)
- **LogoutButton** - Button to logout user
- **AuthGuard** - Higher-order component for auth protection

## Future Enhancements

- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Social authentication (Facebook, Apple)
- [ ] Remember me functionality
- [ ] Two-factor authentication
- [ ] Terms and conditions modal
- [ ] Privacy policy modal
