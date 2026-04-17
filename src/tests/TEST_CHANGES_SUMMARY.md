# Test Work Summary

## Scope

This file summarizes all testing work completed in phase 1 and phase 2, plus the follow-up fix for TypeScript module resolution in test files.

## Phase 1 Summary (Foundation + Broad Unit Coverage)

### 1) Jest + Testing Library setup

- Added Jest scripts in package.json:
  - test
  - test:watch
  - test:coverage
- Added Jest/Babel config:
  - jest.config.cjs
  - babel.config.cjs
- Added shared test bootstrap:
  - src/test/setupTests.ts
  - src/test/**mocks**/fileMock.ts

### 2) Core/shared coverage added

- Route guards
- Theme provider/context behavior
- I18n provider/context behavior
- Auth provider/session behavior
- Utility modules (apiError/helpers/priceLevels/lib utils)

### 3) Feature coverage added (business-focused)

- Data source switching behavior
- Service layer tests for:
  - home
  - favorites
  - onboarding
  - users
  - notifications
- Mapper/util tests for:
  - favorites
  - notifications
  - profile
  - users
  - place-detail
  - admin
  - moderator
  - onboarding

## Phase 2 Summary (Largest Gaps: Notifications Pages/Hooks/Components)

### 1) New high-impact tests added

- Notifications hook tests:
  - useNotifications
  - useNotificationsCount
- Notifications context/provider tests:
  - NotificationsCountProvider
- Notifications presentation tests:
  - NotificationBell
  - NotificationItem
  - NotificationsPage

### 2) Coverage impact (major files)

- NotificationBell.tsx: moved from untested to high coverage.
- NotificationItem.tsx: moved from untested to covered.
- useNotifications.ts: moved from untested to strongly covered.
- useNotificationsCount.ts: now fully covered.
- NotificationsPage.tsx: now covered.
- NotificationsCountContext.tsx: now covered.

### 3) Global coverage trend

- Overall coverage increased compared to phase 1 baseline, with strongest gains in notifications presentation and application layers.

## Clean Architecture Refactor for Tests

### Test structure introduced under src/tests/unit

#### Application layer tests

- application/notifications/services
- application/notifications/mappers
- application/notifications/hooks
- application/notifications/context

#### Presentation layer tests

- presentation/notifications/components
- presentation/notifications/pages
- presentation/notifications/utils

### Why this structure

- Keeps tests close to architectural responsibility.
- Makes regression ownership clearer.
- Improves discoverability for future feature work.

## Follow-up Fix: Cannot Find Module in Test Files

### Problem

TypeScript diagnostics in test files reported unresolved alias imports like @/....

### Root cause

- App tsconfig excluded test files.
- Test files were not consistently attached to a tsconfig that knows alias paths and Jest types.

### Fix implemented

- Added tsconfig.test.json with:
  - Jest/testing library types
  - alias path mapping for @/_ -> src/_
  - include patterns for all test trees
  - explicit exclude override

This resolves module resolution errors for test files created in this work.

## Phase 3 Summary (Cross-Feature Architecture Expansion)

### 1) Existing feature tests moved into architecture tree

- Moved existing tests from feature folders into `src/tests/unit/application/...` for:
  - home services/utils
  - favorites services/mappers/utils
  - onboarding services/utils
  - users services/mappers
  - place-detail utils
  - admin utils
  - moderator utils
  - profile mappers
- Updated moved test imports to consistent alias-based paths.

### 2) New application-layer tests added

- Home:
  - `useHomeSeeAll`
- Favorites:
  - `useFavorites`
- Onboarding:
  - `useOnboarding`
- Users:
  - `usePublicProfile`
- Place-detail:
  - `placeDetailService`
  - `usePlaceDetail`
- Admin:
  - `adminService`
  - `useManageUsers`
- Moderator:
  - `moderatorService`
  - `useModeratorDashboard`
- Profile:
  - `profileService`
  - `useProfile`

### 3) New presentation-layer tests added

- Home:
  - `LocationPermissionBanner`
  - `HomeSeeAllPage`
- Favorites:
  - `FavoritesPage`
- Onboarding:
  - `OnboardingOptionButton`
  - `OnboardingPage`
- Users:
  - `PublicProfilePage`
- Place-detail:
  - `StarRatingInput`
  - `PlaceDetailPage`
- Admin:
  - `AdminFilterChips`
  - `ManageUsersPage`
- Moderator:
  - `ModeratorDashboardPage`
- Profile:
  - `ProfilePreferenceOptionButton`
  - `ProfilePage`
- Shared UI primitives:
  - `presentation/shared/components/button.test.tsx`

### 4) Stabilization fixes applied after first full run

- Fixed Jest factory scoping violations by renaming mock variables to allowed prefixed names.
- Added targeted test-level module mocks for static-heavy dependencies:
  - onboarding `AuthShell`
  - place-detail typography/CSS import
- Stabilized i18n mock function references in hook tests to avoid timing/re-render flakiness.
- Hardened async assertions in selected hook/page tests.
- Made date-grouping assertion deterministic in notifications presentation utility tests by freezing system time.
- Removed a remaining `act(...)` warning in `FavoritesPage` tests.

### 5) Final validation snapshot

- Full suite status:
  - 61/61 test suites passed
  - 226/226 tests passed
- Coverage snapshot after phase 3:
  - Statements: 37.45%
  - Branches: 31.49%
  - Functions: 31.90%
  - Lines: 38.56%

## What is covered vs not fully covered yet

### Covered well

- Providers/guards/shared utilities
- Service and mapper layers for many features
- Notifications vertical slice (context/hooks/components/page)

### Still partially covered

- Large page-level UI in some features (home/place-detail/admin/moderator/profile)
- Some heavy hooks with complex UI orchestration
- Several shared UI primitives with no direct behavior tests yet

## Run Commands

- Run all tests:
  npm test

- Watch mode:
  npm run test:watch

- Coverage report:
  npm run test:coverage

- Run notifications architecture tests only:
  npm test -- --runInBand src/tests/unit/application/notifications src/tests/unit/presentation/notifications

## Notes

- This summary stays intentionally concise and under 500 lines.
- Generated coverage folders are not part of source changes and can be cleaned after reports.
