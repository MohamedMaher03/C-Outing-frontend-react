# Auth Error Handling — Design & Changes

## The Problem

There was a **type mismatch** between errors thrown by the mock layer and errors thrown by the real backend (via axios), which caused error identification to **silently fail** in the UI.

### Before (Broken Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MOCK SCENARIO (worked)                               │
│                                                                             │
│  authMock throws → Error("INVALID_CREDENTIALS")                             │
│  useLogin catches →  err.message = "INVALID_CREDENTIALS"  ✅                │
│  AUTH_ERROR_MESSAGES["INVALID_CREDENTIALS"] → mapped correctly              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     REAL BACKEND SCENARIO (broken)                          │
│                                                                             │
│  Backend returns → { success: false, error: { code: "INVALID_CREDENTIALS" }}│
│  Axios throws   → Error("Request failed with status code 401")              │
│  useLogin catches → err.message = "Request failed with status code 401" ❌  │
│  AUTH_ERROR_MESSAGES["Request failed..."] → undefined → generic fallback    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Root cause:** The hooks relied on `err.message` to identify the error type.

- Mocks set `message` to the error code → worked by coincidence.
- Axios sets `message` to a generic HTTP string → never matched any key.

---

## The Solution

Introduce a **normalisation layer** that converts _any_ thrown error into an `AuthError` with a predictable `.code` property.

### After (Fixed Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BOTH SCENARIOS (works)                             │
│                                                                             │
│  authMock / authApi → throws AuthError { code: "INVALID_CREDENTIALS" }      │
│  useLogin catches   → err.code = "INVALID_CREDENTIALS"  ✅                  │
│  AUTH_ERROR_MESSAGES["INVALID_CREDENTIALS"] → correct user message          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Files Changed

### New Files

| File                           | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `errors/AuthError.ts`          | Custom error class extending `Error` with a typed `.code` property |
| `errors/normalizeAuthError.ts` | Converts axios errors (or any error) into `AuthError`              |
| `errors/index.ts`              | Barrel re-exports                                                  |

### Modified Files

| File                 | What changed                                                                          |
| -------------------- | ------------------------------------------------------------------------------------- |
| `api/authApi.ts`     | Each method now wraps its axios call in try-catch → `throw normalizeAuthError(error)` |
| `mocks/authMock.ts`  | Throws `AuthError` instead of plain `Error`                                           |
| `hooks/useLogin.ts`  | Reads `err.code` via `instanceof AuthError` instead of `err.message`                  |
| `hooks/useSignUp.ts` | Same change as useLogin                                                               |
| `constants/index.ts` | Added `AuthErrorCode` type alias                                                      |
| `index.ts` (barrel)  | Exports `AuthError`, `normalizeAuthError`, `AuthErrorCode`                            |

---

## How `normalizeAuthError` Resolves Errors (Priority Order)

```
1. Already an AuthError?              → return as-is
2. AxiosError with response body?
   a. body.error.code exists?         → use that code  (matches ApiResponse<T>)
   b. body.errorCode exists?          → use that code  (alternative shape)
3. AxiosError with HTTP status?       → map status to code (401→INVALID_CREDENTIALS, 409→EMAIL_ALREADY_EXISTS)
4. AxiosError with no response?       → NETWORK_ERROR
5. Plain Error with known code msg?   → use message as code (backward compat)
6. Anything else                      → UNKNOWN_ERROR
```

This priority chain means:

- **If your backend sends error codes in the response body** (the ideal case), those are used directly.
- **If the backend sends no body but returns a meaningful HTTP status**, we fall back to a status-code mapping.
- **If there's no network connection at all**, the user sees "Network error" instead of a cryptic message.

---

## Why This Design Is Good

### 1. Single Responsibility — Each layer does one thing

- **`AuthError`**: Just a typed error container. No logic.
- **`normalizeAuthError`**: Just error translation. No HTTP calls, no storage.
- **`authApi`**: Just HTTP. Normalises errors at the boundary.
- **Hooks**: Just UI state. Reads `.code` — no error-parsing logic.

### 2. Backend-Ready Without UI Changes

When you switch from mocks to the real API:

```ts
// authService.ts — this is the ONLY line you change:
import { authApi } from "../api/authApi"; // ← real backend
// import { authMock as authApi } from "../mocks/authMock";  // ← mocks
```

The hooks, components, and error messages all continue to work identically because both layers throw the same `AuthError` shape.

### 3. Type Safety

`AuthError.code` is typed as `AuthErrorCode` (= `keyof typeof AUTH_ERROR_MESSAGES`), so:

- You can't accidentally throw an unknown error code.
- You can't forget to add a message for a new code.
- TypeScript will flag any mismatch at compile time.

### 4. Extensible

To handle a new error (e.g., `ACCOUNT_LOCKED`):

1. Add the message to `AUTH_ERROR_MESSAGES` in `constants/index.ts`.
2. Done — the normaliser and hooks automatically pick it up.

### 5. Graceful Degradation

If the backend returns an unexpected error shape, the normaliser falls through to `UNKNOWN_ERROR` instead of crashing. The user always sees a human-readable message.

---

## Architecture Diagram

```
  ┌──────────────┐
  │   LoginForm   │   (React component)
  │   SignUpForm   │
  └──────┬───────┘
         │ calls hook
  ┌──────▼───────┐
  │   useLogin    │   catches AuthError, reads .code
  │   useSignUp   │   maps code → AUTH_ERROR_MESSAGES → UI string
  └──────┬───────┘
         │ calls context
  ┌──────▼───────┐
  │  AuthContext   │   delegates to authService
  └──────┬───────┘
         │
  ┌──────▼───────┐
  │  authService   │   business logic + localStorage
  └──────┬───────┘
         │
  ┌──────▼──────────────────────────┐
  │  authApi          authMock       │   ← both throw AuthError
  │  (axios + normalizeAuthError)    │
  └──────┬──────────────────────────┘
         │
  ┌──────▼───────┐
  │   Backend     │   returns { error: { code: "..." } }
  │   (real API)  │   or HTTP status codes
  └──────────────┘
```
