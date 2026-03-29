# C-Outing Frontend

Frontend for C-Outing, a Cairo-focused outing discovery platform that helps users quickly find places matching mood, budget, area, and personal preferences.

## Product Summary

C-Outing is designed for fast decision-making in real moments where users ask: "Where should we go now?"

This frontend delivers:

- Personalized recommendation journeys after onboarding.
- Discovery experiences across districts, venue types, and price ranges.
- Venue detail experiences with ratings, reviews, and social proof.
- Account-level personalization including favorites, notifications, and profile preferences.
- Operational dashboards for admin and moderator workflows.

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router (role-based route guards)
- Tailwind CSS + Radix UI
- React Hook Form + Zod
- Axios (centralized API client and interceptors)
- Framer Motion
- ESLint

## What I Built

The project covers a complete multi-role application experience:

- User-side product surface:
  - Authentication (login, sign up, verify email, password recovery).
  - Onboarding-first personalization flow.
  - Home discovery and recommendation feeds.
  - Favorites management and place detail interactions.
  - Profile, privacy, support, and notification settings.
- Admin surface:
  - User, venue, review, category, and system-management views.
- Moderator surface:
  - Content moderation views for reviews, places, and reports.

## Architecture Overview

This codebase follows a clean layered architecture with strict separation of concerns:

1. UI layer (pages and presentational components)
2. Hook layer (state orchestration and side effects)
3. Service layer (feature-level business/data orchestration)
4. API layer (HTTP client, endpoint contracts, interceptors)

```text
UI (Pages/Components)
				|
				v
Hooks (State + Effects)
				|
				v
Services (Use-case/Data Logic)
				|
				v
API Client (Axios + Contracts + Interceptors)
```

Architecture outcomes:

- High maintainability through clear boundaries.
- Easier testing due to isolated responsibilities.
- Faster feature delivery using repeatable feature patterns.
- Lower regression risk when integrating backend contracts.

## Project Structure Strategy

The repository is organized by feature domains (auth, home, profile, favorites, place-detail, notifications, admin, moderator, onboarding, users), each containing dedicated API, hooks, services, types, and pages.

This feature-first structure is combined with shared foundations for:

- Reusable UI primitives and layouts.
- Central API endpoint and Axios configuration.
- Shared utility functions and common types.

## Technical Highlights

- Role-aware routing and guarded flows for user, admin, and moderator access.
- Centralized API envelope handling and typed error normalization.
- Modular React architecture using lazy-loaded routes and scalable feature boundaries.
- Type-safe forms and validation using React Hook Form + Zod.
- Consistent UI system built with Tailwind CSS and Radix primitives.

## Engineering Focus

This frontend was built with production-minded priorities:

- Clear architecture over ad-hoc coupling.
- Consistent UX behavior across role-specific flows.
- Scalable code organization for team collaboration.
- Strong maintainability for post-deployment iteration.
