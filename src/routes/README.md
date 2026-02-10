# Routes Documentation

## Overview

The `routes` folder contains all routing-related configuration and components for the HCARS Frontend application.

## Directory Structure

```
routes/
├── index.tsx         # Protected & Public route components
├── routes.tsx        # Route paths configuration
└── README.md         # This file
```

## Files

### `index.tsx`

Contains two main wrapper components:

- **`ProtectedRoute`**: Wraps routes that require authentication. Redirects unauthenticated users to the login page.
- **`PublicRoute`**: Wraps public routes (login, register, home). Redirects authenticated users away to the recommendations page.

Both components check authentication state and loading status before rendering.

### `routes.tsx`

Centralized route configuration with:

- **`ROUTES`**: Object containing all route paths
  - `HOME`, `LOGIN`, `REGISTER`: Public routes
  - `RECOMMENDATIONS`, `VENUE_DETAIL()`, `SEARCH`, `PROFILE`, `FAVORITES`: Protected routes
  - `NOT_FOUND`: Catch-all route

- **`ROUTE_DESCRIPTIONS`**: Metadata for each route (title, description) useful for navigation menus and breadcrumbs

## Usage Examples

### Importing Routes

```typescript
import { ROUTES } from '../routes/routes'

// Use in navigation
<Link to={ROUTES.HOME}>Home</Link>
<Link to={ROUTES.RECOMMENDATIONS}>Recommendations</Link>
<Link to={ROUTES.VENUE_DETAIL('123')}>Venue Details</Link>
```

### Using Protected Routes

```typescript
import { ProtectedRoute } from '../routes'

// In your app
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
```

## Route Structure

### Public Routes (No Authentication Required)

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Authentication Required)

- `/recommendations` - Personalized recommendations
- `/venue/:id` - Venue details page
- `/search` - Search venues
- `/profile` - User profile
- `/favorites` - Favorite venues

### Error Routes

- `*` - Catch-all for 404 Not Found

## Implementation Notes

1. **AuthContext Integration**: ProtectedRoute and PublicRoute require `AuthContext` to provide:
   - `user`: Current authenticated user object
   - `loading`: Loading state during auth check

2. **Route Transitions**: When routes update, consider implementing:
   - Loading spinners during transitions
   - Scroll-to-top behavior
   - Analytics tracking

3. **Future Enhancements**:
   - Nested routes for layouts
   - Lazy loading of page components
   - Route-specific permissions/roles
   - Transition animations

## Related Files

- [AuthContext.tsx](../context/AuthContext.tsx) - Authentication state management
- [App.tsx](../App.tsx) - Main app component with Router setup
- [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md) - Phase 1 routing setup plan
