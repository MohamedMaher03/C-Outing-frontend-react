# Clean Architecture Documentation

## Architecture Overview

This project follows a strict **UI → Hook → Service → API** layered architecture for scalable and maintainable code.

```
┌─────────────────────────────────────────────────┐
│                  UI Layer (Pages)                │
│  - ProfilePage, FavoritesPage, PlaceDetailPage  │
│  - Pure UI components and routing               │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              Hook Layer (Custom Hooks)           │
│  - useProfile, useFavorites, usePlaceDetail     │
│  - State management, side effects, async ops    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           Service Layer (API Services)           │
│ - profileService, favoritesService, etc.        │
│ - Pure async functions, API communication       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│               API Layer (HTTP Client)            │
│            - axios instance (apiClient)          │
│            - Centralized configuration           │
└─────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. UI Layer (Pages)

**Location:** `src/pages/`

**✅ Pages SHOULD:**

- Contain ONLY UI composition
- Handle page-level routing logic
- Control layout and conditional rendering
- Call custom hooks
- Pass data to child components

**❌ Pages SHOULD NOT:**

- Make API calls directly
- Contain business logic
- Have complex state management
- Use useState for API data
- Import axios or fetch

**Example:**

```tsx
const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    profile,
    loading,
    selectedInterests,
    toggleInterest,
    savePreferences,
  } = useProfile();

  if (loading) return <LoadingState />;

  return (
    <div>
      <h1>{profile?.name}</h1>
      {/* Pure UI rendering */}
    </div>
  );
};
```

### 2. Hook Layer

**Location:** `src/hooks/`

**✅ Hooks SHOULD:**

- Manage all state (useState, useReducer)
- Handle side effects (useEffect)
- Handle async operations
- Manage loading and error states
- Call service layer functions
- Return clean data and action functions
- Be reusable across components

**❌ Hooks SHOULD NOT:**

- Make direct axios/fetch calls
- Contain business logic calculations
- Import API client directly (use services instead)

**Example:**

```tsx
export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getUserProfile(); // Service call
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return { profile, loading };
};
```

### 3. Service Layer

**Location:** `src/services/api/`

**✅ Services SHOULD:**

- Contain ONLY API communication logic
- Use the apiClient instance
- Be pure async functions
- Have clear, specific function names
- Export TypeScript types/interfaces
- Handle request/response mapping

**❌ Services SHOULD NOT:**

- Have React dependencies
- Manage state
- Use hooks
- Contain UI logic
- Handle errors with UI alerts (return/throw errors)

**Example:**

```tsx
export const getUserProfile = async (): Promise<UserProfile> => {
  return apiClient.get<UserProfile>("/profile");
};

export const updateUserProfile = async (
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  return apiClient.put<UserProfile>("/profile", data);
};
```

### 4. API Layer

**Location:** `src/services/api/client.ts`

**Responsibilities:**

- Centralized HTTP client configuration
- Base URL management
- Authentication token handling
- Request/response interceptors
- Error handling
- Retry logic

## File Structure

```
src/
├── pages/                          # UI Layer
│   ├── ProfilePage.tsx
│   ├── FavoritesPage.tsx
│   └── PlaceDetailPage.tsx
│
├── hooks/                          # Hook Layer
│   ├── useProfile.ts
│   ├── useFavorites.ts
│   ├── usePlaceDetail.ts
│   └── index.ts                    # Central export
│
├── services/
│   └── api/                        # Service Layer
│       ├── client.ts               # API Client (axios)
│       ├── profileService.ts
│       ├── favoritesService.ts
│       └── placeDetailService.ts
│
└── types/                          # Shared TypeScript types
    └── index.ts
```

## Refactored Pages

### 1. ProfilePage

**Hook:** `useProfile`  
**Service:** `profileService`  
**Features:**

- User profile display
- Preferences management (interests, vibe, districts, budget)
- Save preferences
- Sign out functionality

### 2. FavoritesPage

**Hook:** `useFavorites`  
**Service:** `favoritesService`  
**Features:**

- Display saved/favorite places
- Toggle favorite status
- Loading and error states

### 3. PlaceDetailPage

**Hook:** `usePlaceDetail`  
**Service:** `placeDetailService`  
**Features:**

- Display place details
- Toggle favorite
- Open in Google Maps
- Track user interactions
- Navigation

## Benefits of This Architecture

### 1. **Separation of Concerns**

Each layer has a single, well-defined responsibility.

### 2. **Testability**

- Services can be tested independently
- Hooks can be tested with React Testing Library
- UI can be tested with mocked hooks

### 3. **Reusability**

- Services can be used across multiple hooks
- Hooks can be used across multiple components
- No duplication of API logic

### 4. **Maintainability**

- Easy to locate and fix bugs
- Changes in one layer don't cascade
- Clear contract between layers

### 5. **Scalability**

- Easy to add new features
- Simple to onboard new developers
- Consistent patterns across codebase

## Usage Examples

### Creating a New Feature

#### 1. Create Service

```tsx
// src/services/api/venueService.ts
export const getVenueDetails = async (id: string): Promise<Venue> => {
  return apiClient.get<Venue>(`/venues/${id}`);
};
```

#### 2. Create Hook

```tsx
// src/hooks/useVenueDetails.ts
export const useVenueDetails = (venueId: string) => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      const data = await getVenueDetails(venueId);
      setVenue(data);
      setLoading(false);
    };
    fetchVenue();
  }, [venueId]);

  return { venue, loading };
};
```

#### 3. Use in Page

```tsx
// src/pages/VenueDetailPage.tsx
const VenueDetailPage = () => {
  const { id } = useParams();
  const { venue, loading } = useVenueDetails(id);

  if (loading) return <Loading />;
  return <div>{venue?.name}</div>;
};
```

## TypeScript Best Practices

### 1. Use Type-Only Imports

```tsx
import { apiClient } from "./client";
import type { Place } from "../../data/mockData";
```

### 2. Export Types from Services

```tsx
export interface UserProfile {
  userId: number;
  name: string;
  email: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  // ...
};
```

### 3. Strong Hook Return Types

```tsx
interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  savePreferences: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  // ...
};
```

## Error Handling Strategy

### Service Layer

```tsx
// Throw errors, don't handle UI
export const getUserProfile = async (): Promise<UserProfile> => {
  return apiClient.get<UserProfile>("/profile");
  // Let errors propagate
};
```

### Hook Layer

```tsx
// Catch and store errors in state
const [error, setError] = useState<string | null>(null);

try {
  const data = await getUserProfile();
  setProfile(data);
} catch (err) {
  setError(err instanceof Error ? err.message : "Failed to load");
  console.error("Error:", err);
}
```

### UI Layer

```tsx
// Display errors to user
if (error) {
  return <ErrorMessage message={error} />;
}
```

## Migration Guide

To refactor an existing page:

1. **Identify API calls** in the page component
2. **Create service functions** for each API call
3. **Create a custom hook** that:
   - Manages state
   - Calls service functions
   - Handles loading/error states
4. **Refactor the page** to:
   - Remove all state management
   - Remove API calls
   - Use the custom hook
   - Keep only UI rendering

## Additional Resources

- **Hooks Index:** `src/hooks/index.ts` - Central export for all hooks
- **API Client:** `src/services/api/client.ts` - HTTP client configuration
- **Types:** `src/types/index.ts` - Shared TypeScript types

---

**Last Updated:** February 18, 2026  
**Architecture Version:** 1.0  
**Refactored By:** Senior Frontend Architect
