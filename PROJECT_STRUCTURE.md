# HCARS Frontend Project Structure

Comprehensive React frontend for the Intent-Conditioned Hybrid Context-Aware Recommendation System (HCARS). This document explains the project architecture, directory structure, and key design decisions.

## 🏗 Architecture Overview

### Three-Tier Architecture Model

```
┌─────────────────────────────────────────┐
│        PRESENTATION LAYER                │
│     (React Components, UI)               │
├─────────────────────────────────────────┤
│        APPLICATION LAYER                 │
│   (Services, Context, State Management)  │
├─────────────────────────────────────────┤
│          DATA LAYER                      │
│    (API Client, Tracking, Storage)       │
└─────────────────────────────────────────┘
```

## 📁 Directory Structure

```
src/
├── assets/                 # Static assets
│   ├── images/            # PNG, JPG, SVG images
│   └── icons/             # Icon files
│
├── components/            # React Components (Presentation Layer)
│   ├── common/            # Reusable generic components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── recommendations/   # Recommendation display components
│   │   ├── RecommendationsList.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── RecommendationFilters.tsx
│   ├── venue/             # Venue detail components
│   │   ├── VenueDetailView.tsx
│   │   ├── VenueCard.tsx
│   │   ├── ReviewList.tsx
│   │   └── ReviewForm.tsx
│   ├── context-input/     # User context/intent input
│   │   ├── MoodSelector.tsx
│   │   ├── CompanionSelector.tsx
│   │   ├── BudgetSelector.tsx
│   │   ├── TimeSelector.tsx
│   │   └── ContextPanel.tsx
│   └── profile/           # User profile components
│       ├── ProfileView.tsx
│       ├── PreferencesPanel.tsx
│       └── FavoritesView.tsx
│
├── pages/                 # Full-page components (Route Views)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── RecommendationsPage.tsx
│   ├── VenueDetailsPage.tsx
│   ├── SearchPage.tsx
│   ├── ProfilePage.tsx
│   └── FavoritesPage.tsx
│
├── services/             # Business logic (Application Layer)
│   ├── api/              # API service layer
│   │   ├── client.ts     # HTTP client with auth & retry logic
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── venueService.ts
│   │   ├── recommendationService.ts
│   │   ├── interactionService.ts
│   │   └── index.ts
│   └── tracking/         # User interaction tracking
│       ├── sessionService.ts    # Session management
│       └── interactionTracker.ts # Background interaction queue
│
├── context/              # React Context (Global State)
│   ├── AuthContext.tsx   # Authentication & user state
│   └── ThemeContext.tsx  # Theme, language, RTL support
│
├── hooks/                # Custom React Hooks
│   ├── useGeolocation.ts # Geolocation with permission handling
│   ├── useAsync.ts       # Generic async operations
│   ├── useLocalStorage.ts # Persistent state
│   └── index.ts
│
├── types/                # TypeScript Type Definitions
│   └── index.ts          # All interfaces & types (User, Venue, Interaction, etc.)
│
├── utils/                # Utility Functions (Data Layer)
│   ├── constants.ts      # App constants, enums
│   ├── helpers.ts        # Helper functions (format, calculate, debounce, etc.)
│   └── index.ts
│
├── config/               # Configuration Files
│   └── api.ts            # API endpoints, constants, configuration
│
├── i18n/                 # Internationalization (i18n)
│   ├── translations.ts   # Arabic/English translations
│   └── index.ts
│
├── styles/               # Global Styles
│   ├── variables.css     # CSS custom properties, design tokens
│   ├── globals.css       # Global styles, resets, base styles
│   └── index.css         # (existing)
│
├── App.tsx              # Root component with routing
├── main.tsx             # Application entry point
└── index.css            # (existing, to be deprecated after migration)
```

## 🎯 Core Concepts

### 1. **Presentation Layer** (`/components`, `/pages`)

Contains all React UI components organized by feature area:

- **Common**: Reusable components (Button, Card, Modal, Toast, etc.)
- **Feature-based**: Components grouped by feature (auth, recommendations, venue, etc.)
- **Pages**: Full-page components representing routes/views

**Key Principles**:

- Components are stateless (manage state via Context/Hooks)
- Props-driven configuration
- Accessibility-first (ARIA, semantic HTML)
- Responsive mobile-first design
- RTL-aware (flexbox, margins, padding)

### 2. **Application Layer** (`/services`, `/context`, `/hooks`)

Manages business logic and state:

- **API Services**: HTTP requests with authentication, retry logic, error handling
- **Context**: Global state (Auth, Theme) with React Context API
- **Custom Hooks**: Reusable logic (useGeolocation, useAsync, useLocalStorage)

**Key Principles**:

- Separation of concerns (API logic separate from components)
- No UI in services (pure business logic)
- Error handling and logging
- Performance optimization (memoization, debouncing)

### 3. **Data Layer** (`/config`, `/types`, `/utils`, `/i18n`)

Handles data definitions, API configuration, and utilities:

- **Types**: TypeScript interfaces for type safety
- **Config**: API endpoints, constants, environment variables
- **Utils**: Helper functions, formatting, calculations
- **i18n**: Translations for multi-language support

## 🔄 Data Flow

### Recommendation Flow Example

```
User Input (ContextInput)
       ↓
User Context State (ThemeContext + local state)
       ↓
RecommendationsPage triggers API call
       ↓
recommendationService.getRecommendations()
       ↓
apiClient.get() with auth interceptor
       ↓
Backend API returns recommendations
       ↓
RecommendationsList renders results
       ↓
User clicks venue → interactionTracker.trackInteraction()
       ↓
Queued & sent to /api/interactions in background
```

### User Interaction Tracking

```
Component (e.g., VenueCard)
       ↓
interactionTracker.trackInteraction(userId, venueId, 'Click', context)
       ↓
Queued in memory (non-blocking)
       ↓
Batch sent to API every 30s or when queue >= 5
       ↓
Retry failed interactions (max 3 retries)
```

## 🔐 Authentication Flow

```
User submits login form
       ↓
authService.login(email, password)
       ↓
apiClient.post() → /api/users/login
       ↓
Response includes JWT token
       ↓
apiClient.setToken(token) → stored in localStorage
       ↓
AuthContext updated
       ↓
Protected routes render; auth interceptor adds token to requests
```

## 🌐 Internationalization (i18n)

**Features**:

- Arabic (ar) and English (en) support
- RTL/LTR layout automatic switching
- Translation keys stored in `translations.ts`
- Theme context manages language selection
- Document `dir` and `lang` attributes updated automatically

**Usage**:

```typescript
import { t } from "@/i18n";
const heading = t("recommendations.title", language); // Translates key
```

## ⚙️ Configuration

### Environment Variables

Create `.env` and `.env.local` files:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_APP_NAME=HCARS
```

### API Configuration

Located in [`src/config/api.ts`](src/config/api.ts):

- `API_ENDPOINTS`: All API routes
- `API_CONFIG`: Timeout, retry attempts, retry delay
- `PAGINATION`: Default page sizes

## 🎨 Styling Approach

**CSS Variables**: All design tokens defined in [`src/styles/variables.css`](src/styles/variables.css)

- Colors (primary, secondary, status, neutral)
- Spacing (xs to 3xl)
- Typography (font families, sizes, line heights)
- Border radius, shadows, transitions, z-index

**Component Styling**:

- CSS Modules (recommended for scoped styles)
- Inline styles for dynamic values
- Global styles in `globals.css`

**Dark Mode & RTL Support**:

```css
[data-theme="dark"] {
  /* dark mode styles */
}
[dir="rtl"] {
  /* RTL adjustments */
}
```

## 🚀 Performance Optimizations

1. **Code Splitting**: Pages lazy-loaded via React.lazy()
2. **Caching**: API responses cached where appropriate
3. **Optimistic Updates**: UI updates before API confirmation
4. **Infinite Scroll**: Pagination for large recommendation lists
5. **Background Tracking**: Interaction tracking non-blocking
6. **Debouncing/Throttling**: Applied to search, scroll events
7. **Memoization**: useMemo, React.memo for expensive components

## 🔗 Backend Integration

### Expected Backend Endpoints

All endpoints defined in [`src/config/api.ts`](src/config/api.ts):

```
POST   /api/users/login
POST   /api/users/register
GET    /api/users/{id}
PUT    /api/users/{id}
GET    /api/recommendations/{userId}
GET    /api/venues
GET    /api/venue/{id}
POST   /api/rate/{venueId}
POST   /api/interactions
GET    /api/venues/search
```

### Authentication

JWT token-based:

- Obtained from login/register endpoints
- Stored in `localStorage`
- Sent via `Authorization: Bearer {token}` header
- Automatically added by `apiClient` interceptor
- Cleared on 401 response or logout

## 📦 Dependencies

### Current (as of package.json)

- **react**: 19.2.0 - UI library
- **react-dom**: 19.2.0 - DOM rendering

### Recommended Additions

```json
{
  "react-router-dom": "^6.x", // Routing
  "axios": "^1.x", // HTTP client (alternative to Fetch)
  "i18next": "^23.x", // i18n library (if needed)
  "zustand": "^4.x", // State management (optional)
  "react-query": "^3.x", // Data fetching & caching (optional)
  "react-hook-form": "^7.x", // Form handling
  "@react-icons/all-files": "^4.x" // Icon library
}
```

## 🧪 Testing Strategy

Structure for unit/integration tests:

```
src/
├── components/
│   └── __tests__/
│       └── Button.test.tsx
├── services/
│   └── __tests__/
│       └── authService.test.ts
└── hooks/
    └── __tests__/
        └── useGeolocation.test.ts
```

## 🎓 Development Guidelines

### Component Best Practices

1. **Naming**: PascalCase for components, camelCase for files (e.g., `LoginForm.tsx`)
2. **Props**: Use TypeScript interfaces, destructure props
3. **Hooks**: Custom hooks start with `use` prefix
4. **Files**: One component per file (or related sub-components)
5. **Exports**: Default export for single component, named for utilities

### Service Best Practices

1. **Pure Functions**: No side effects in services
2. **Error Handling**: Catch and re-throw with context
3. **Logging**: Log API calls and errors for debugging
4. **Typing**: Fully typed services and responses
5. **Cancellation**: Support request cancellation for cleanup

### State Management

- **Global State**: Use Context (Auth, Theme)
- **Local State**: useState for component-specific state
- **Derived State**: Compute from props/state, don't store
- **Side Effects**: useEffect for async operations
- **Memoization**: Prevent unnecessary re-renders

## 📝 Project Checklist

- [ ] Install React Router for navigation
- [ ] Implement all service layer endpoints
- [ ] Build common UI components library
- [ ] Set up error boundary
- [ ] Implement protected routes
- [ ] Add loading states and error handling
- [ ] Build recommendation UI components
- [ ] Implement venue detail page
- [ ] Add user profile management
- [ ] Set up interaction tracking
- [ ] Configure Google Maps integration
- [ ] Implement Arabic/English i18n
- [ ] Add unit/integration tests
- [ ] Configure CI/CD pipeline
- [ ] Set up logging and analytics
- [ ] Performance audit and optimization

## 🔗 Key Files Reference

| File                                                         | Purpose                       |
| ------------------------------------------------------------ | ----------------------------- |
| [src/types/index.ts](src/types/index.ts)                     | All TypeScript interfaces     |
| [src/config/api.ts](src/config/api.ts)                       | API endpoints & configuration |
| [src/services/api/client.ts](src/services/api/client.ts)     | HTTP client with auth         |
| [src/services/api/index.ts](src/services/api/index.ts)       | Service exports               |
| [src/context/AuthContext.tsx](src/context/AuthContext.tsx)   | Authentication state          |
| [src/context/ThemeContext.tsx](src/context/ThemeContext.tsx) | Theme & language              |
| [src/i18n/translations.ts](src/i18n/translations.ts)         | i18n translations             |
| [src/utils/constants.ts](src/utils/constants.ts)             | Application constants         |
| [src/styles/variables.css](src/styles/variables.css)         | Design tokens                 |

## 🚀 Getting Started

### Setup

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## 📧 Questions & Support

For clarification on architecture decisions or implementation details, refer to this README or the inline documentation in source files.

---

**Last Updated**: February 4, 2026  
**React Version**: 19.2.0  
**TypeScript**: 5.9.3  
**Build Tool**: Vite 7.2.4
