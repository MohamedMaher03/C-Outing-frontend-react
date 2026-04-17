# C-Outing Frontend Reference

Updated: 2026-04-15
Purpose: handoff guide to build another project with the same architecture, code style, and structure.

## 1) Stack and Tooling

- React 19 + TypeScript (strict)
- Vite
- React Router v7
- Tailwind CSS + CSS variables + Radix UI + class-variance-authority
- React Hook Form + Zod
- Axios with interceptors
- Framer Motion
- ESLint (`eslint.config.js`)

Scripts from `package.json`:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## 2) Core Architecture

Provider chain in `src/main.tsx`:

```text
I18nProvider -> ThemeProvider -> AuthProvider -> App
```

Feature flow:

```text
UI Page/Component
  -> Hook (state + effects + actions)
    -> Service (business logic)
      -> DataSource (api/mock selector)
        -> API module (pure HTTP)
          -> axios instance (interceptors)
```

Mapper-enabled features use:

```text
Hook -> Service -> Mapper -> DataSource/API
```

## 3) Key Root Files

- `README.md`: product and stack summary
- `ARCHITECTURE.md`: clean architecture description
- `src/config/api.ts`: centralized endpoint map
- `src/config/axios.config.ts`: token injection + envelope unwrapping + ApiError mapping
- `src/utils/apiError.ts`: global error model/helpers
- `tailwind.config.ts`: design token integration and animations
- `src/index.css`: theme tokens, typography roles, dark mode, RTL utilities
- `src/types/index.ts`: shared `User`, `ApiResponse<T>`, `PaginatedResponse<T>`

## 4) Repository Snapshot

Top-level `src` counts:

- `features`: 218 files
- `components`: 31 files
- `assets`: 15 files
- `config`: 2 files
- `routes`: 2 files
- `utils`: 5 files

Feature file counts:

- `auth`: 41
- `admin`: 35
- `place-detail`: 27
- `moderator`: 23
- `profile`: 22
- `notifications`: 17
- `home`: 15
- `favorites`: 13
- `onboarding`: 13
- `users`: 12

No test files were found under `src` (`*.test.*` / `*.spec.*`).

## 5) Shared Cross-Cutting Systems

### 5.1 Routing and Guards

Main files:

- `src/App.tsx`
- `src/routes/index.tsx`
- `src/routes/RoleBasedRoute.tsx`

Guards:

- `ProtectedRoute`: requires auth, enforces onboarding for user role
- `PublicRoute`: redirects authenticated users away from auth pages
- `OnboardingRoute`: only authenticated users with incomplete onboarding
- `RoleBasedRoute`: role-restricted route wrapper

Layouts:

- `src/components/layout/AppLayout.tsx`: user shell + mobile nav + notifications provider
- `src/components/layout/DashboardLayout.tsx`: admin/moderator shell
- `src/components/layout/RoleBasedLayout.tsx`: role-based layout switch
- `src/components/layout/AuthShell.tsx`: auth/onboarding shell

### 5.2 API and Error Standardization

Main files:

- `src/config/api.ts`
- `src/config/axios.config.ts`
- `src/utils/apiError.ts`

Key behavior:

- Request interceptor adds `Authorization` header from local storage token.
- Success interceptor unwraps backend `ApiResponse<T>` envelope.
- Error interceptor throws `ApiError` with normalized message/status/validation map.
- 401 clears session (`authToken`, `authUser`) and redirects to `/login` (outside auth flow paths).

### 5.3 Theme and i18n

Theme files:

- `src/components/theme/theme.context.ts`
- `src/components/theme/ThemeProvider.tsx`
- `src/components/theme/useTheme.ts`
- `src/components/theme/ThemeToggle.tsx`

Theme behavior:

- preference: `light | dark | system`
- storage key: `c-outing-theme`
- provider toggles `.dark` class and `color-scheme` on root

i18n files:

- `src/components/i18n/translations.ts`
- `src/components/i18n/I18nProvider.tsx`
- `src/components/i18n/useI18n.ts`
- `src/components/i18n/LanguageToggle.tsx`

i18n behavior:

- languages: `en`, `ar`
- storage key: `c-outing-language`
- updates `document.documentElement.lang` and `dir`
- interpolation + locale number formatting supported

### 5.4 Styling and UI Primitives

Styling core:

- `tailwind.config.ts`: tokenized colors via CSS vars, animations, dark mode class
- `src/index.css`: light/dark tokens, typography role classes (`text-role-*`), glass utilities, reduced-motion and RTL helpers

UI primitive layer:

- path: `src/components/ui/`
- style: Radix wrappers + Tailwind + CVA variants + `cn()` helper (`src/lib/utils.ts`)
- examples:
  - `button.tsx` + `button-variants.ts`
  - `badge.tsx` + `badge-variants.ts`
  - `input.tsx`, `alert.tsx`, `tabs.tsx`, `slider.tsx`, `avatar.tsx`

## 6) Feature Folder Template

Used by most features:

```text
src/features/<feature>/
  api/
  services/
  hooks/
  pages/
  components/
  types/
  mappers/      # when needed
  utils/        # when needed
  constants/    # when needed
  context/      # when needed
  errors/       # mainly auth
  validation/   # mainly auth
  mocks/
  index.ts
```

Rules:

- Pages do not call axios directly.
- Hooks orchestrate state and side effects.
- Services own business logic and call datasource.
- API modules are transport-only.
- Mappers normalize unstable backend payloads.

## 7) Feature-by-Feature Summary

### auth

Implemented:

- login/register/verify-email/forgot/reset/logout
- auth context provider with session restoration
- JWT claim mapping to app `User`
- zod form schemas
- auth-specific error normalization

Important files:

- `src/features/auth/context/AuthProvider.tsx`
- `src/features/auth/services/authService.ts`
- `src/features/auth/api/authApi.ts`
- `src/features/auth/errors/normalizeAuthError.ts`
- `src/features/auth/validation/signUp.schema.ts`

### home

Implemented:

- personalized/trending recommendations
- discovery filters (district/type/price-range/top-rated)
- mood and similar recommendations
- favorites toggle integration
- geolocation-aware filtering and distance labels

Important files:

- `src/features/home/hooks/useHomeHook.ts`
- `src/features/home/services/homeService.ts`
- `src/features/home/components/PlaceCard.tsx`
- `src/features/home/pages/HomePage.tsx`

### favorites

Implemented:

- paginated list fetch
- add/remove/check/toggle
- optimistic save updates
- mapper normalization of pagination and duplicate venue IDs

Important files:

- `src/features/favorites/mappers/favoritesMapper.ts`
- `src/features/favorites/services/favoritesService.ts`
- `src/features/favorites/hooks/useFavorites.ts`

### notifications

Implemented:

- feed retrieval + unread count
- mark one/all read, delete
- global unread badge context
- service-level cache + in-flight dedupe

Important files:

- `src/features/notifications/services/notificationsService.ts`
- `src/features/notifications/mappers/notificationsMapper.ts`
- `src/features/notifications/hooks/useNotifications.ts`
- `src/features/notifications/context/NotificationsCountContext.tsx`

### onboarding

Implemented:

- multi-step onboarding preferences flow
- submit preferences
- updates auth user onboarding completion state

Important files:

- `src/features/onboarding/hooks/useOnboarding.ts`
- `src/features/onboarding/services/onboardingService.ts`
- `src/features/onboarding/mappers/onboardingMapper.ts`
- `src/features/onboarding/pages/OnboardingPage.tsx`

### place-detail

Implemented:

- venue details
- reviews lifecycle (list/create/update/delete/report)
- social reviews pagination and lazy loading
- favorite and like interactions
- interaction tracking calls

Important files:

- `src/features/place-detail/mappers/placeDetailMapper.ts`
- `src/features/place-detail/services/placeDetailService.ts`
- `src/features/place-detail/hooks/usePlaceDetail.ts`
- `src/features/place-detail/services/favoriteAdapter.ts`

### profile

Implemented:

- profile fetch/update including avatar and bio
- preferences, notifications, privacy settings
- account actions (sign out, delete account, data export)

Important files:

- `src/features/profile/mappers/profileMapper.ts`
- `src/features/profile/services/profileService.ts`
- `src/features/profile/hooks/useProfile.ts`

### users

Implemented:

- public profile screen
- review activity section
- fallback behavior when public profile endpoint is unavailable
- cache + in-flight dedupe in service

Important files:

- `src/features/users/services/userService.ts`
- `src/features/users/mappers/userMapper.ts`
- `src/features/users/hooks/usePublicProfile.ts`

### admin

Implemented:

- dashboard stats/activity
- manage users, places, reviews, categories, settings surfaces
- mapper layer for DTO normalization

Important files:

- `src/features/admin/api/adminApi.ts`
- `src/features/admin/api/adminApi.mapper.ts`
- `src/features/admin/services/adminService.ts`
- `src/features/admin/hooks/useAdminDashboard.ts`

### moderator

Implemented:

- moderator dashboard
- reported content workflows
- shared moderation actions via admin service for places/reviews

Important files:

- `src/features/moderator/api/moderatorApi.ts`
- `src/features/moderator/services/moderatorService.ts`
- `src/features/moderator/hooks/useModeratorDashboard.ts`

## 8) Mapper and Type Strategy

Mapper-heavy files:

- `src/features/place-detail/mappers/placeDetailMapper.ts`
- `src/features/favorites/mappers/favoritesMapper.ts`
- `src/features/notifications/mappers/notificationsMapper.ts`
- `src/features/profile/mappers/profileMapper.ts`
- `src/features/users/mappers/userMapper.ts`
- `src/features/admin/api/adminApi.mapper.ts`

Common mapper behavior:

- unwrap nested payload shapes
- normalize unknown values safely
- clamp invalid numeric ranges
- normalize dates and IDs
- dedupe list items

Type strategy:

- `types/index.ts`: domain/UI-facing types
- `types/dataSource.ts`: API/mock contract interfaces

## 9) Utilities and Shared Constants

Global:

- `src/utils/apiError.ts`: central error model/helpers
- `src/utils/helpers.ts`: formatting/debounce/throttle/distance
- `src/utils/constants.ts`: app constants
- `src/utils/priceLevels.ts`: canonical budget enum and display metadata

Canonical price levels:

`price_cheapest | cheap | mid_range | expensive | luxury`

## 10) DataSource Mock Toggle Pattern

Pattern in datasource files:

1. Parse feature-specific env flag
2. Fallback to global `VITE_USE_MOCKS`
3. Export `featureDataSource = mock or api`

Flags present:

- `VITE_AUTH_USE_MOCKS`
- `VITE_HOME_USE_MOCKS`
- `VITE_FAVORITES_USE_MOCKS`
- `VITE_NOTIFICATIONS_USE_MOCKS`
- `VITE_ONBOARDING_USE_MOCKS`
- `VITE_PLACE_DETAIL_USE_MOCKS`
- `VITE_PROFILE_USE_MOCKS`
- `VITE_ADMIN_USE_MOCKS`
- `VITE_MODERATOR_USE_MOCKS`
- `VITE_USERS_USE_MOCKS`
- global fallback: `VITE_USE_MOCKS`

Representative files:

- `src/features/favorites/services/favoritesDataSource.ts`
- `src/features/place-detail/services/placeDetailDataSource.ts`
- `src/features/notifications/services/notificationsDataSource.ts`
- `src/features/profile/services/profileDataSource.ts`

## 11) Backend Contract Notes in Repo

Contract docs:

- `src/features/admin/BACKEND_ADMIN_CONTRACT_SUMMARY.md`
- `src/features/moderator/BACKEND_MODERATOR_CONTRACT_SUMMARY.md`
- `src/features/profile/BACKEND_PROFILE_SETTINGS_APIS.md`
- `src/features/users/BACKEND_PUBLIC_PROFILE_GAPS.md`

Current documented gaps:

- Admin dashboard currently aggregates multiple endpoints; one consolidated endpoint is recommended.
- Some admin/moderator operations remain backend-contract dependent.
- Public profile by arbitrary user ID is still a documented backend gap.

## 12) How to Add a New Feature in This Style

1. Create `src/features/<new-feature>/` with standard folders.
2. Add endpoints in `src/config/api.ts`.
3. Define domain types in `types/index.ts`.
4. Define datasource interface in `types/dataSource.ts`.
5. Implement `api/<newFeature>Api.ts` (pure transport).
6. Implement `mocks/<newFeature>Mock.ts` with same contract.
7. Implement `services/<newFeature>DataSource.ts` for env-based switch.
8. Add mapper if payload may be inconsistent.
9. Implement service (orchestration + validation/normalization).
10. Implement hook (state + effects + errors + actions).
11. Implement page/component UI that consumes the hook.
12. Export from `features/<new-feature>/index.ts`.
13. Register lazy route in `src/App.tsx` with proper guard/layout.

## 13) Recommended Reading Order for Another Agent

1. `README.md`
2. `ARCHITECTURE.md`
3. `src/main.tsx`
4. `src/App.tsx`
5. `src/routes/index.tsx`
6. `src/config/api.ts`
7. `src/config/axios.config.ts`
8. `src/utils/apiError.ts`
9. `tailwind.config.ts`
10. `src/index.css`
11. `src/features/favorites/*` (compact clean template)
12. `src/features/place-detail/*` (advanced mapper/hook complexity)
13. `src/features/auth/*` (auth/session/error conventions)

## 14) One-Paragraph Summary

This codebase is feature-first and layered: UI -> Hook -> Service -> DataSource -> API, with mapper normalization in complex domains. It centralizes endpoint and error handling, supports API/mock switching per feature, enforces role/onboarding route guards, and uses a tokenized Tailwind design system with dark mode and RTL-aware i18n. Reusing these patterns will produce a very similar architecture and implementation style.
