# HCARS Frontend - Quick Reference Guide

## 🚀 Quick Start

### Import Examples

```typescript
// Types
import { User, Venue, Interaction, RecommendationResponse } from "@/types";

// API Services
import {
  authService,
  userService,
  venueService,
  recommendationService,
} from "@/services/api";

// Context Hooks
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// Custom Hooks
import { useGeolocation, useAsync, useLocalStorage } from "@/hooks";

// Utils & i18n
import { t } from "@/i18n";
import { formatRating, calculateDistance, MOODS, COMPANIONS } from "@/utils";
```

## 📋 Common Tasks

### Authentication

```typescript
// Login
const { login } = useAuth();
await login(email, password);

// Register
const { register } = useAuth();
await register({ name, email, password, age });

// Check if authenticated
const { isAuthenticated, user } = useAuth();
```

### Fetch Recommendations

```typescript
import { recommendationService } from "@/services/api";

const recommendations = await recommendationService.getRecommendations(
  userId,
  {
    mood: "relaxed",
    companion: "friends",
    budget: "medium",
    timeOfDay: "evening",
  },
  10, // limit
  0, // offset
);
```

### Track User Interaction

```typescript
import { interactionTracker } from "@/services/tracking/interactionTracker";

interactionTracker.trackInteraction(
  userId,
  venueId,
  "Click",
  { mood: "relaxed", companion: "friends" },
  { positionInList: 0 },
);
```

### Get User Location

```typescript
const { location, isLoading, error } = useGeolocation((watch = true));

if (location) {
  console.log(`Lat: ${location.lat}, Lng: ${location.lng}`);
}
```

### Use Translation

```typescript
import { useTheme } from "@/context/ThemeContext";
import { t } from "@/i18n";

const { language } = useTheme();
const title = t("recommendations.title", language);
```

### Persistent State

```typescript
const [preferences, setPreferences] = useLocalStorage("userPrefs", {});

// Automatically saved to localStorage
setPreferences({ budget: "high" });
```

### Async Operations

```typescript
const { status, data, error, execute } = useAsync(
  () => venueService.getVenueDetails(venueId),
  true  // immediate execution
);

if (status === 'loading') return <Spinner />;
if (status === 'error') return <Error message={error.message} />;
if (status === 'success') return <VenueDetails venue={data} />;
```

## 🗂️ File Organization Rules

### Component Structure

```typescript
// src/components/recommendations/RecommendationCard.tsx

import React from 'react';
import { Venue } from '@/types';
import { formatRating } from '@/utils';

interface RecommendationCardProps {
  venue: Venue;
  onSelect: (venueId: number) => void;
}

export function RecommendationCard({ venue, onSelect }: RecommendationCardProps) {
  return (
    <div onClick={() => onSelect(venue.venueId)}>
      {/* component content */}
    </div>
  );
}
```

### Service Structure

```typescript
// src/services/api/newService.ts

import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/config/api";

export const newService = {
  async fetchData(id: number): Promise<DataType> {
    const response = await apiClient.get(API_ENDPOINTS.somePath(id));
    return response.data!;
  },
};
```

### Hook Structure

```typescript
// src/hooks/useCustomHook.ts

import { useState, useEffect } from "react";

export function useCustomHook(deps?: unknown[]) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // effect code
  }, deps);

  return state;
}
```

## 🎯 API Endpoints Cheatsheet

| Method | Endpoint                    | Service                                      |
| ------ | --------------------------- | -------------------------------------------- |
| POST   | `/users/login`              | `authService.login()`                        |
| POST   | `/users/register`           | `authService.register()`                     |
| GET    | `/users/{id}`               | `userService.getProfile()`                   |
| PUT    | `/users/{id}`               | `userService.updateProfile()`                |
| GET    | `/recommendations/{userId}` | `recommendationService.getRecommendations()` |
| GET    | `/venue/{id}`               | `venueService.getVenueDetails()`             |
| GET    | `/venues`                   | `venueService.listVenues()`                  |
| POST   | `/rate/{venueId}`           | `interactionService.submitRating()`          |
| POST   | `/interactions`             | `interactionService.trackInteraction()`      |

## 🎨 Design Tokens Usage

### Colors

```css
color: var(--color-primary);
background: var(--color-gray-100);
border: 1px solid var(--color-gray-300);
```

### Spacing

```css
padding: var(--spacing-md);
margin-bottom: var(--spacing-lg);
gap: var(--spacing-sm);
```

### Typography

```css
font-family: var(--font-family-base);
font-size: var(--font-size-lg);
line-height: var(--line-height-normal);
```

### Transitions

```css
transition: color var(--transition-base);
```

## 🌍 i18n Constants

```typescript
// Available languages
type Language = "ar" | "en";

// Translation keys (examples)
t("nav.home", "en"); // "Home"
t("nav.home", "ar"); // "الرئيسية"
t("recommendations.title", language);
t("moods.relaxed", language);
t("companions.friends", language);
t("budget.medium", language);
t("time.evening", language);
```

## 🔒 Authentication Flow

```
LoginForm → authService.login()
          → API stores JWT
          → apiClient.setToken()
          → AuthContext updated
          → Protected routes accessible

Authorization header automatically added to all requests:
Authorization: Bearer <jwt_token>
```

## 📊 State Management Pattern

```typescript
// Global state via Context
const { user, isAuthenticated } = useAuth();
const { language, isDarkMode } = useTheme();

// Local component state
const [filters, setFilters] = useState<VenueFilter>({});

// Persistent state
const [lastSearch, setLastSearch] = useLocalStorage("lastSearch", "");

// Async operations
const { data: venues, status } = useAsync(() =>
  venueService.listVenues(filters),
);
```

## ⚠️ Error Handling

```typescript
try {
  const result = await recommendationService.getRecommendations(userId);
} catch (error) {
  if (error instanceof Error) {
    console.error('Fetch failed:', error.message);
  }
}

// In components with useAsync
if (status === 'error') {
  return <ErrorBoundary message={error?.message} />;
}
```

## 🎓 Dos and Don'ts

### ✅ Do

- Import types from `@/types`
- Use services for API calls
- Store global state in Context
- Use custom hooks for reusable logic
- Add loading/error states to UI
- Use TypeScript for type safety
- Follow RTL-aware styling

### ❌ Don't

- Call API directly from components
- Store sensitive data in localStorage
- Create new Contexts without purpose
- Inline complex logic in components
- Skip error handling
- Hardcode API endpoints
- Assume LTR layout

## 📞 Support

Refer to [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed documentation.

---

**Quick Reference Last Updated**: February 4, 2026
