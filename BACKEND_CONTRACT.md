# Backend Integration Contract — HCARS Frontend

> **Generated:** 2026-03-01  
> **Source:** Static analysis of `c-outing-frontend-react/src/`  
> **Audience:** Backend Engineer(s)  
> **Base URL (expected):** `VITE_API_BASE_URL` env var — defaults to `http://localhost:5000/api`

---

## Table of Contents

1. [High-Level Feature Map](#1-high-level-feature-map)
2. [Authentication Strategy](#2-authentication-strategy)
3. [API Response Envelope](#3-api-response-envelope)
4. [Endpoint Specification](#4-endpoint-specification)
   - 4.1 [Auth](#41-auth)
   - 4.2 [Home / Recommendations](#42-home--recommendations)
   - 4.3 [Favorites](#43-favorites)
   - 4.4 [Onboarding](#44-onboarding)
   - 4.5 [Place Detail](#45-place-detail)
   - 4.6 [Interactions](#46-interactions)
   - 4.7 [Profile](#47-profile)
5. [Data Schemas (DTOs)](#5-data-schemas-dtos)
6. [Query Parameters, Filtering & Pagination](#6-query-parameters-filtering--pagination)
7. [File Handling / Multipart Uploads](#7-file-handling--multipart-uploads)
8. [Gap Analysis](#8-gap-analysis)
   - 8.1 [Mock Placeholders Currently In Use](#81-mock-placeholders-currently-in-use)
   - 8.2 [Missing Error Handling / Backend Responsibilities](#82-missing-error-handling--backend-responsibilities)
9. [Validation Rules (Frontend-enforced)](#9-validation-rules-frontend-enforced)
10. [Appendix: Error Code Map](#10-appendix-error-code-map)

---

## 1. High-Level Feature Map

| #   | Feature                                                                     | Requires API? | Current Data Source                | Service Layer                                 | Key Hook                                                         |
| --- | --------------------------------------------------------------------------- | :-----------: | ---------------------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| 1   | **Auth** (Login, Register, Logout)                                          |      Yes      | `authMock.ts`                      | `authService.ts` → `authApi.ts`               | `useLogin`, `useSignUp`, `useLogout`                             |
| 2   | **Home** (Curated, Trending, Top-Rated)                                     |      Yes      | `homeMock.ts`                      | `homeService.ts` → `homeApi.ts`               | `useHome`                                                        |
| 3   | **Favorites** (List, Add, Remove, Check)                                    |      Yes      | `favoritesMock.ts`                 | `favoritesService.ts` → `favoritesApi.ts`     | `useFavorites`                                                   |
| 4   | **Onboarding** (Submit/Update Preferences)                                  |      Yes      | `onboardingMock.ts`                | `onboardingService.ts` → `onboardingApi.ts`   | `useOnboarding`                                                  |
| 5   | **Place Detail** (Details, Reviews, Social Reviews, AI Summary, Similar)    |      Yes      | `placeDetailMock.ts`               | `placeDetailService.ts` → `placeDetailApi.ts` | `usePlaceDetail`                                                 |
| 6   | **Profile** (Get/Edit, Preferences, Notifications, Privacy, Export, Delete) |      Yes      | Inline mock in `profileService.ts` | `profileService.ts` → `profileApi.ts`         | `useProfile`, `useEditProfile`, `useNotifications`, `usePrivacy` |
| 7   | **Interactions** (Record user events)                                       |      Yes      | inline mock                        | via `placeDetailApi.ts`                       | `usePlaceDetail.trackInteraction`                                |

> **Architecture pattern:** Every feature follows `Hook → Service → API → axios`. Services currently import mocks instead of real API calls. Each service has a commented-out import line for the real API (`// import { xxxApi } from "../api/xxxApi";`) ready for toggle.

---

## 2. Authentication Strategy

| Property            | Value                                                                             |
| ------------------- | --------------------------------------------------------------------------------- |
| **Mechanism**       | **Bearer Token (JWT)**                                                            |
| **Token storage**   | `localStorage` key `"authToken"`                                                  |
| **Injection**       | Axios request interceptor: `Authorization: Bearer <token>`                        |
| **401 Handling**    | Axios response interceptor clears storage, redirects to `/login`                  |
| **User storage**    | `localStorage` key `"authUser"` (JSON-serialized `User` object)                   |
| **Session restore** | On app mount, `authService.restoreSession()` reads token + user from localStorage |

### Required Headers (all authenticated requests)

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Backend Must:

1. Return a JWT token in login/register responses.
2. Validate the `Authorization: Bearer <token>` header on all protected endpoints.
3. Return **HTTP 401** on expired/invalid tokens — the frontend will auto-redirect to login.

---

## 3. API Response Envelope

The frontend expects **two response patterns** depending on the endpoint:

### Pattern A — Wrapped Response (Auth endpoints)

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string; // e.g. "INVALID_CREDENTIALS", "EMAIL_ALREADY_EXISTS"
  };
}
```

**Used by:** `POST /login`, `POST /register`

### Pattern B — Direct Response (All other endpoints)

Most non-auth endpoints return the DTO directly as the response body **without** wrapping.

**Used by:** All favorites, home, place-detail, profile, onboarding, and interaction endpoints.

> **Recommendation:** Standardize all endpoints on Pattern A for consistency, but this is the current frontend expectation.

---

## 4. Endpoint Specification

### 4.1 Auth

#### `POST /login`

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | No                 |
| **Content-Type**  | `application/json` |

**Request Body:**

```json
{
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "token": "eyJhbGci...",
    "user": {
      "userId": 1,
      "name": "string",
      "email": "string",
      "age": 28,
      "preferences": [0.9, 0.6],
      "lastUpdated": "2026-03-01T00:00:00Z",
      "totalInteractions": 12
    }
  }
}
```

**Error Responses:**

| Status  | `error.code`          | Meaning                 |
| ------- | --------------------- | ----------------------- |
| 400/401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 422     | `INVALID_CREDENTIALS` | Validation failure      |

---

#### `POST /register`

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | No                 |
| **Content-Type**  | `application/json` |

**Request Body:**

```json
{
  "name": "string (min 2, max 50 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)",
  "phone": "string (regex: /^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$/)",
  "age": "number (optional)"
}
```

**Response `201 Created`:**
Same shape as login response.

**Error Responses:**

| Status | `error.code`           | Meaning         |
| ------ | ---------------------- | --------------- |
| 409    | `EMAIL_ALREADY_EXISTS` | Duplicate email |
| 409    | `PHONE_ALREADY_EXISTS` | Duplicate phone |

---

#### `POST /logout`

|                   |              |
| ----------------- | ------------ |
| **Auth Required** | Yes (Bearer) |

**Request Body:** None  
**Response `200 OK`:** Empty or `{ "success": true }`

---

### 4.2 Home / Recommendations

#### `GET /recommendations/{userId}`

Returns AI-curated/personalized place recommendations for the user.

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `Place[]`

```json
[
  {
    "id": "string",
    "name": "string",
    "category": "string",
    "image": "string (URL)",
    "rating": 4.8,
    "reviewCount": 342,
    "distance": "2.3 km",
    "district": "string",
    "description": "string",
    "whyRecommend": "string",
    "priceLevel": 1, // 1 | 2 | 3
    "tags": ["string"],
    "isSaved": false,
    "lat": 30.0561,
    "lng": 31.2243,
    "isOpen": true,
    "openUntil": "10:00 PM",
    "matchScore": 97 // 0-100 (optional)
  }
]
```

---

#### `GET /venues/trending`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `Place[]` (same schema as above, sorted by popularity/review count)

---

#### `GET /venues/top-rated`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `Place[]` (same schema, sorted by rating descending)

---

#### `POST /venues/{placeId}/save`

Toggles the saved/bookmark state of a place.

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes                |
| **Content-Type**  | `application/json` |

**Request Body:**

```json
{
  "isSaved": true
}
```

**Response `200 OK`:** Empty or acknowledgment

---

### 4.3 Favorites

#### `GET /users/{userId}/favorites`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `FavoritePlace[]`

```json
[
  {
    "...Place fields": "...",
    "savedAt": "2026-03-01T00:00:00Z"
  }
]
```

---

#### `POST /users/{userId}/favorites`

Add a place to favorites.

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes                |
| **Content-Type**  | `application/json` |

**Request Body:**

```json
{
  "placeId": "string"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "isFavorite": true,
  "message": "string (optional)"
}
```

---

#### `DELETE /users/{userId}/favorites/{placeId}`

Remove a place from favorites.

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:**

```json
{
  "success": true,
  "isFavorite": false,
  "message": "string (optional)"
}
```

---

#### `GET /users/{userId}/favorites/{placeId}/check`

Check if a specific place is in user's favorites.

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:**

```json
{
  "isFavorite": true
}
```

---

### 4.4 Onboarding

#### `POST /users/{userId}/preferences`

Submit initial onboarding preferences (called once after the user completes the
4-step onboarding wizard). After a successful response the frontend sets
`hasCompletedOnboarding: true` on the user object and navigates to `/`.

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes (Bearer JWT)   |
| **Content-Type**  | `application/json` |

**URL Parameter**

| Name     | Type   | Description                       |
| -------- | ------ | --------------------------------- |
| `userId` | string | The authenticated user's `userId` |

**Request Body** (`OnboardingPayload`)

> The frontend transforms UI values before sending:
>
> - `budget: "Medium"` (UI) → `budgetRange: "medium"` (lowercase)
> - `districts: string[]` (UI) → `preferredDistricts: string[]`

```json
{
  "interests": ["cafes", "nightlife", "rooftops"],
  "vibe": 65,
  "preferredDistricts": ["Zamalek", "Downtown"],
  "budgetRange": "medium"
}
```

**Field Constraints**

| Field                | Type       | Required | Notes                                       |
| -------------------- | ---------- | -------- | ------------------------------------------- |
| `interests`          | `string[]` | Yes      | Min 2 items (UI-enforced). Category IDs.    |
| `vibe`               | `number`   | Yes      | Integer `0–100`. 0 = calm, 100 = energetic  |
| `preferredDistricts` | `string[]` | Yes      | Min 1 item (UI-enforced)                    |
| `budgetRange`        | `string`   | Yes      | `"low"` \| `"medium"` \| `"high"` \| `null` |

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "Preferences saved successfully"
}
```

**Error Responses**

| Status | Condition                                                                    |
| ------ | ---------------------------------------------------------------------------- |
| `400`  | Missing required fields                                                      |
| `401`  | Invalid or expired JWT                                                       |
| `403`  | `userId` does not match token                                                |
| `404`  | User not found                                                               |
| `409`  | Preferences already submitted (optional — frontend can re-POST to overwrite) |

---

#### `PATCH /users/{userId}/preferences`

Partial update of preferences after the initial onboarding has been completed
(e.g. from the user profile settings page).

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes (Bearer JWT)   |
| **Content-Type**  | `application/json` |

**URL Parameter**

| Name     | Type   | Description                       |
| -------- | ------ | --------------------------------- |
| `userId` | string | The authenticated user's `userId` |

**Request Body** (Partial `OnboardingPayload` — send only the fields to update)

> Same field names and transformations as the POST endpoint apply.

```json
{
  "interests": ["outdoor", "coffee"],
  "vibe": 40,
  "preferredDistricts": ["Maadi"],
  "budgetRange": "high"
}
```

**Field Constraints** (same as POST — all fields optional for PATCH)

| Field                | Type       | Required | Notes                                       |
| -------------------- | ---------- | -------- | ------------------------------------------- |
| `interests`          | `string[]` | No       | Replaces entire interests list if provided  |
| `vibe`               | `number`   | No       | Integer `0–100`                             |
| `preferredDistricts` | `string[]` | No       | Replaces entire districts list if provided  |
| `budgetRange`        | `string`   | No       | `"low"` \| `"medium"` \| `"high"` \| `null` |

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "data": null,
  "message": "Preferences updated successfully"
}
```

**Error Responses**

| Status | Condition                     |
| ------ | ----------------------------- |
| `400`  | Invalid field values          |
| `401`  | Invalid or expired JWT        |
| `403`  | `userId` does not match token |
| `404`  | User not found                |

---

### 4.5 Place Detail

#### `GET /places/{placeId}`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `PlaceDetail`

```json
{
  "...Place fields": "...",
  "openingHours": {
    "open": "09:00 AM",
    "close": "11:00 PM"
  },
  "phoneNumber": "string (optional)",
  "website": "string (optional)",
  "reviews": "Review[] (optional, can be fetched separately)",
  "similarPlaces": "Place[] (optional, can be fetched separately)"
}
```

---

#### `GET /places/{placeId}/reviews`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `Review[]`

```json
[
  {
    "id": "string",
    "userId": "string",
    "userName": "string",
    "userAvatar": "string (optional URL)",
    "rating": 5,
    "comment": "string",
    "date": "2026-01-15T00:00:00Z"
  }
]
```

---

#### `POST /places/{placeId}/reviews`

Submit a new user review.

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes                |
| **Content-Type**  | `application/json` |

**Request Body:**

```json
{
  "rating": 5,
  "comment": "string"
}
```

> **Note:** `userId` should be extracted from the JWT server-side; the frontend does NOT send it.

**Response `201 Created`:** The created `Review` object (with generated `id`, `userName`, `date`).

---

#### `GET /places/{placeId}/social-reviews`

Returns scraped/aggregated reviews from social media platforms.

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `SocialMediaReview[]`

```json
[
  {
    "id": "string",
    "platform": "instagram" | "twitter" | "facebook" | "tiktok" | "google",
    "author": "string",
    "authorAvatar": "string (optional URL)",
    "content": "string",
    "sentiment": "positive" | "neutral" | "negative",
    "date": "2026-02-10T00:00:00Z",
    "likes": 234,
    "url": "string (optional, link to original post)"
  }
]
```

---

#### `GET /places/{placeId}/review-summary`

Returns an NLP/AI-generated summary of all reviews for the place.

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `ReviewSummary`

```json
{
  "overallSentiment": "positive" | "neutral" | "negative",
  "averageRating": 4.7,
  "totalReviews": 342,
  "summary": "string (multi-sentence NLP summary)",
  "highlights": ["string", "string"],
  "commonTopics": [
    {
      "topic": "Sunset Views",
      "count": 187,
      "sentiment": "positive" | "neutral" | "negative"
    }
  ]
}
```

---

#### `GET /places/{placeId}/similar`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `Place[]` (limited set of similar venues)

---

### 4.6 Interactions

#### `POST /interactions`

Records a user-interaction event for the recommendation engine.

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes                |
| **Content-Type**  | `application/json` |

**Request Body:**

```json
{
  "placeId": "string",
  "actionType": "Click" | "ViewDetails" | "Rate" | "Favorite" | "Share",
  "ratingValue": 5,               // optional, only for "Rate"
  "comment": "string",            // optional
  "sessionId": "string",          // client-generated GUID/timestamp
  "positionInList": 3             // optional, position in recommendation list
}
```

> **Note:** The frontend generates `sessionId` as `session_{timestamp}_{random}` and stores it in `sessionStorage`. `userId` should be extracted from the JWT server-side.

**Response `200 OK`:** Empty or acknowledgment. **Non-critical** — the frontend swallows errors from this endpoint to not affect UX.

---

### 4.7 Profile

#### `GET /users/{userId}`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `UserProfile`

```json
{
  "userId": 1,
  "name": "string",
  "email": "string",
  "avatar": "string (optional URL)",
  "bio": "string (optional)"
}
```

---

#### `PUT /users/{userId}`

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes                |
| **Content-Type**  | `application/json` |

**Request Body:** Partial `EditProfileData`

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "bio": "string"
}
```

**Response `200 OK`:** Updated `UserProfile`

---

#### `GET /users/{userId}/preferences`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `UserPreferences`

```json
{
  "interests": ["cafes", "rooftops"],
  "vibe": 65,
  "districts": ["Zamalek", "Downtown"],
  "budget": "Medium"
}
```

---

#### `PUT /users/{userId}/preferences`

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes                |
| **Content-Type**  | `application/json` |

**Request Body:** `UpdatePreferencesRequest`

```json
{
  "interests": ["string"],
  "vibe": 50,
  "districts": ["string"],
  "budget": "Low" | "Medium" | "High"
}
```

**Response `200 OK`:** Updated `UserPreferences`

---

#### `GET /users/{userId}/notifications`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `NotificationSettings`

```json
{
  "push": {
    "recommendations": true,
    "favorites": true,
    "reviews": false,
    "messages": true,
    "updates": true
  },
  "email": {
    "weekly": true,
    "monthly": false,
    "promotions": true,
    "tips": true
  }
}
```

---

#### `PUT /users/{userId}/notifications`

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes                |
| **Content-Type**  | `application/json` |

**Request Body:** Full `NotificationSettings` (same shape as response)  
**Response `200 OK`:** Updated `NotificationSettings`

---

#### `GET /users/{userId}/privacy`

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** `PrivacySettings`

```json
{
  "profileVisible": true,
  "showLocation": true,
  "showFavorites": false,
  "showActivity": true,
  "dataCollection": true,
  "personalization": true
}
```

---

#### `PUT /users/{userId}/privacy`

|                   |                    |
| ----------------- | ------------------ |
| **Auth Required** | Yes                |
| **Content-Type**  | `application/json` |

**Request Body:** Full `PrivacySettings` (same shape as response)  
**Response `200 OK`:** Updated `PrivacySettings`

---

#### `GET /users/{userId}/data/export`

Download user's personal data as a file.

|                   |                                   |
| ----------------- | --------------------------------- |
| **Auth Required** | Yes                               |
| **Response Type** | `application/octet-stream` (Blob) |

**Response `200 OK`:** Binary file download (the frontend sets `responseType: 'blob'`).

---

#### `DELETE /users/{userId}/account`

Permanently delete the user's account.

|                   |     |
| ----------------- | --- |
| **Auth Required** | Yes |

**Response `200 OK`:** Empty or acknowledgment. Frontend clears localStorage and redirects to `/login`.

---

## 5. Data Schemas (DTOs)

### Core Entities

#### `User`

```typescript
{
  userId: number;
  name: string;
  email: string;
  age: number;
  preferences: number[];        // Preference vector [0.8, 0.5, ...]
  lastUpdated: Date;            // ISO 8601 string
  totalInteractions: number;
}
```

#### `Place` (frontend's primary venue model)

```typescript
{
  id: string;
  name: string;
  category: string;
  image: string;                // URL
  rating: number;
  reviewCount: number;
  distance: string;             // e.g. "2.3 km" — consider returning as number
  district: string;
  description: string;
  whyRecommend: string;         // AI-generated explanation
  priceLevel: 1 | 2 | 3;
  tags: string[];
  isSaved?: boolean;
  lat: number;
  lng: number;
  isOpen?: boolean;
  openUntil?: string;
  matchScore?: number;          // 0-100, recommendation relevance
}
```

#### `Venue` (defined in global types, likely backend entity)

```typescript
{
  venueId: number;
  name: string;
  description: string;
  category: string;
  location: { lat: number; lng: number; address?: string; city?: string; };
  attributes: Record<string, unknown>;
  avgSentimentScore: number;    // 0-1
  featuresVector: number[];
  phoneNumber?: string;
  website?: string;
  hours?: { open: string; close: string; };
  images?: string[];
}
```

> **Important:** The frontend's `Place` interface (from `mockData.ts`) and the `Venue` interface (from `types/index.ts`) represent the **same entity** with different shapes. The backend should either:
>
> - Return the `Place` shape used by the UI (recommended for simplicity), OR
> - Return `Venue` shape and add a mapping layer in the frontend.

#### `Review`

```typescript
{
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;               // 1-5
  comment: string;
  date: Date;                   // ISO 8601
}
```

#### `SocialMediaReview`

```typescript
{
  id: string;
  platform: "instagram" | "twitter" | "facebook" | "tiktok" | "google";
  author: string;
  authorAvatar?: string;
  content: string;
  sentiment: "positive" | "neutral" | "negative";
  date: Date;
  likes?: number;
  url?: string;
}
```

#### `ReviewSummary`

```typescript
{
  overallSentiment: "positive" | "neutral" | "negative";
  averageRating: number;
  totalReviews: number;
  summary: string;              // NLP-generated paragraph
  highlights: string[];
  commonTopics: {
    topic: string;
    count: number;
    sentiment: "positive" | "neutral" | "negative";
  }[];
}
```

#### `Interaction`

```typescript
{
  interactionId?: number;
  userId: number;               // from JWT
  venueId: number;
  actionType: "Click" | "ViewDetails" | "Rate" | "Favorite" | "Share";
  ratingValue?: number;
  comment?: string;
  timestamp: Date;
  sessionId: string;
  positionInList: number;
  context: Record<string, unknown>;
}
```

#### `UserContext` (for recommendation engine)

```typescript
{
  mood?: "relaxed" | "energetic" | "social" | "romantic";
  companion?: "solo" | "friends" | "family" | "partner";
  budget?: "low" | "medium" | "high";
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  weather?: "sunny" | "cloudy" | "rainy" | "hot";
  location?: { lat: number; lng: number; };
}
```

> **Note:** `UserContext` and `RecommendationRequest/Response` are defined in `src/types/index.ts` but **not yet consumed** by any hook or API call. Consider implementing `POST /recommendations` accepting a `RecommendationRequest` body in the future.

---

## 6. Query Parameters, Filtering & Pagination

### Currently Implemented (Frontend-side only)

The frontend defines `VenueFilter` and `PaginatedResponse` types in `src/types/index.ts`:

```typescript
interface VenueFilter {
  category?: string;
  location?: string;
  budgetRange?: "low" | "medium" | "high";
  ratingMin?: number;
  sentimentMin?: number;
  searchQuery?: string;
  pageSize?: number; // default: 10, max: 100
  pageNumber?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}
```

**However**, no API call currently passes these as query parameters. All filtering (search, category, top-rated, open-now, near-me) is done **client-side** in `useHome.ts → applyFilters()`.

### Recommendation for Backend

Support these query parameters on list endpoints (`/venues/trending`, `/venues/top-rated`, `/recommendations/{userId}`):

| Parameter     | Type     | Description                                       |
| ------------- | -------- | ------------------------------------------------- |
| `page`        | `number` | Page number (1-based)                             |
| `limit`       | `number` | Items per page (default 10, max 100)              |
| `category`    | `string` | Filter by category                                |
| `search`      | `string` | Full-text search on name/tags/district            |
| `budgetRange` | `string` | `low`, `medium`, `high`                           |
| `ratingMin`   | `number` | Minimum rating threshold                          |
| `sortBy`      | `string` | `rating`, `distance`, `reviewCount`, `matchScore` |
| `lat` / `lng` | `number` | User's coordinates for distance calc              |

---

## 7. File Handling / Multipart Uploads

**No `multipart/form-data` uploads are currently implemented.** All requests use `application/json`.

### Potential Future Needs

| Feature                   | Use Case                                                                                                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Profile avatar upload** | `UserProfile.avatar` field exists but is currently an optional URL string. If user-uploaded avatars are needed, a `POST /users/{userId}/avatar` endpoint with `multipart/form-data` will be required. |
| **Review media**          | No photo/video attachment on reviews currently, but a likely future feature.                                                                                                                          |

---

## 8. Gap Analysis

### 8.1 Mock Placeholders Currently In Use

Every service file is currently wired to mock implementations. Each has a commented-out import for the real API:

| Service File                                  | Mock File                               | Toggle Comment                                                      |
| --------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| `auth/services/authService.ts`                | `auth/mocks/authMock.ts`                | `//import { authApi }... (WHEN INTEGRATE WITH BACKEND USE THIS)`    |
| `favorites/services/favoritesService.ts`      | `favorites/mocks/favoritesMock.ts`      | Same pattern                                                        |
| `home/services/homeService.ts`                | `home/mocks/homeMock.ts`                | Same pattern                                                        |
| `onboarding/services/onboardingService.ts`    | `onboarding/mocks/onboardingMock.ts`    | Same pattern                                                        |
| `place-detail/services/placeDetailService.ts` | `place-detail/mocks/placeDetailMock.ts` | Same pattern                                                        |
| `profile/services/profileService.ts`          | Inline mocks (no separate mock file)    | `// import { profileApi }... TODO: Uncomment when backend is ready` |

**No MSW (Mock Service Worker) is used.** All mocking is done via in-app mock modules with artificial `setTimeout` delays.

#### Hardcoded Values in Mocks

| Location            | Hardcoded Value                    | Backend Action Needed                                 |
| ------------------- | ---------------------------------- | ----------------------------------------------------- |
| `favoritesApi.ts`   | `CURRENT_USER_ID = 1`              | Replace with authenticated user's ID from JWT context |
| `profileService.ts` | `CURRENT_USER_ID = 1`              | Same                                                  |
| `authMock.ts`       | `MOCK_TOKEN` (fake JWT)            | Generate real JWT                                     |
| `authMock.ts`       | `MOCK_USER` with fixed `userId: 1` | Generate from DB                                      |
| Multiple mocks      | `delay(500)` etc.                  | Remove — real network latency                         |

### 8.2 Missing Error Handling / Backend Responsibilities

#### Error Codes the Frontend Already Handles

| Code                   | Source           | Frontend Message                                    |
| ---------------------- | ---------------- | --------------------------------------------------- |
| `INVALID_CREDENTIALS`  | HTTP 400/401/422 | "Invalid email or password. Please try again."      |
| `EMAIL_ALREADY_EXISTS` | HTTP 409         | "An account with this email already exists."        |
| `PHONE_ALREADY_EXISTS` | HTTP 409         | "An account with this phone number already exists." |
| `NETWORK_ERROR`        | No response      | "Network error. Please check your connection."      |
| `SESSION_EXPIRED`      | HTTP 401         | "Your session has expired. Please log in again."    |
| `UNKNOWN_ERROR`        | Fallback         | "An unexpected error occurred. Please try again."   |

> The frontend's `normalizeAuthError.ts` maps HTTP status → error code. The backend should return `{ "error": { "code": "EMAIL_ALREADY_EXISTS", "message": "..." } }` in the response body for the frontend to pick up the specific code.

#### Missing Error Handling (Backend Should Return)

| Scenario                                          | Suggested HTTP Status | Suggested `error.code` | Notes                                                                                |
| ------------------------------------------------- | --------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Place not found                                   | `404`                 | `PLACE_NOT_FOUND`      | `getPlaceById` — mock throws `Error("Place not found")` but no specific code         |
| Favorite already exists                           | `409`                 | `ALREADY_FAVORITED`    | Not handled; mock silently succeeds                                                  |
| Review validation (empty comment, invalid rating) | `422`                 | `VALIDATION_ERROR`     | Frontend has no server-side validation error display for reviews                     |
| Rate-limiting                                     | `429`                 | `RATE_LIMITED`         | Not handled at all                                                                   |
| User not found (profile)                          | `404`                 | `USER_NOT_FOUND`       | Not handled                                                                          |
| Unauthorized access to another user's data        | `403`                 | `FORBIDDEN`            | `userId` in URL could be tampered; backend must verify JWT `userId === param userId` |
| Account already deleted                           | `410`                 | `ACCOUNT_DELETED`      | Not handled                                                                          |
| Data export in progress                           | `202`                 | `EXPORT_IN_PROGRESS`   | The mock returns immediately; real export may be async                               |
| Preferences not yet set (new user)                | `404` or empty        | `NO_PREFERENCES`       | Onboarding flow depends on this                                                      |

#### Non-Auth Endpoints: Generic Error Handling

All non-auth hooks use a generic pattern:

```typescript
catch (err) {
  setError(err instanceof Error ? err.message : "Failed to <action>");
}
```

They do **not** parse error codes — they just display `error.message`. The backend should return meaningful `message` strings in error responses.

---

## 9. Validation Rules (Frontend-enforced)

These rules are enforced client-side via Zod schemas. The backend should enforce the **same or stricter** rules.

### Login

| Field      | Rule                                  |
| ---------- | ------------------------------------- |
| `email`    | Required, valid email format, trimmed |
| `password` | Required, minimum 6 characters        |

### Registration

| Field               | Rule                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| `fullName` → `name` | Required, 2-50 characters, trimmed                                          |
| `email`             | Required, valid email, trimmed                                              |
| `phone`             | Required, regex: `/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/` |
| `password`          | Required, min 8 chars, must contain: 1 uppercase, 1 lowercase, 1 digit      |
| `confirmPassword`   | Must match `password` (client-only, not sent to server)                     |
| `acceptTerms`       | Must be `true` (client-only, not sent to server)                            |

> **Note:** The frontend maps `fullName` → `name` before sending. `confirmPassword` and `acceptTerms` are NOT sent to the backend.

### Onboarding Preferences

| Field       | Rule                                  |
| ----------- | ------------------------------------- |
| `interests` | Min 2 selected                        |
| `vibe`      | 0-100 (slider)                        |
| `districts` | Min 1 selected                        |
| `budget`    | One of: `"Low"`, `"Medium"`, `"High"` |

### Review Submission

| Field     | Rule                                                     |
| --------- | -------------------------------------------------------- |
| `rating`  | 1-5 (integer, star input)                                |
| `comment` | Non-empty string (frontend enforces via disabled button) |

---

## 10. Appendix: Error Code Map

Complete set of error codes the frontend currently handles (from `auth/constants/index.ts`):

```typescript
{
  "INVALID_CREDENTIALS": "Invalid email or password. Please try again.",
  "EMAIL_ALREADY_EXISTS": "An account with this email already exists.",
  "PHONE_ALREADY_EXISTS": "An account with this phone number already exists.",
  "NETWORK_ERROR": "Network error. Please check your connection and try again.",
  "UNKNOWN_ERROR": "An unexpected error occurred. Please try again.",
  "SESSION_EXPIRED": "Your session has expired. Please log in again."
}
```

HTTP status → code mapping in `normalizeAuthError.ts`:

| HTTP Status | Auth Error Code        |
| ----------- | ---------------------- |
| 400         | `INVALID_CREDENTIALS`  |
| 401         | `INVALID_CREDENTIALS`  |
| 409         | `EMAIL_ALREADY_EXISTS` |
| 422         | `INVALID_CREDENTIALS`  |
| No response | `NETWORK_ERROR`        |

The backend can also return the error code directly in the response body at `error.code` or `errorCode` — the normalizer checks both paths.

---

## Complete Endpoint Summary Table

| #   | Method   | Path                                        | Auth | Request Body               | Response                       |
| --- | -------- | ------------------------------------------- | :--: | -------------------------- | ------------------------------ |
| 1   | `POST`   | `/login`                                    |  No  | `LoginRequest`             | `ApiResponse<AuthApiResponse>` |
| 2   | `POST`   | `/register`                                 |  No  | `RegisterRequest`          | `ApiResponse<AuthApiResponse>` |
| 3   | `POST`   | `/logout`                                   | Yes  | —                          | `void`                         |
| 4   | `GET`    | `/recommendations/{userId}`                 | Yes  | —                          | `Place[]`                      |
| 5   | `GET`    | `/venues/trending`                          | Yes  | —                          | `Place[]`                      |
| 6   | `GET`    | `/venues/top-rated`                         | Yes  | —                          | `Place[]`                      |
| 7   | `POST`   | `/venues/{placeId}/save`                    | Yes  | `{ isSaved }`              | `void`                         |
| 8   | `GET`    | `/users/{userId}/favorites`                 | Yes  | —                          | `FavoritePlace[]`              |
| 9   | `POST`   | `/users/{userId}/favorites`                 | Yes  | `{ placeId }`              | `ToggleFavoriteResponse`       |
| 10  | `DELETE` | `/users/{userId}/favorites/{placeId}`       | Yes  | —                          | `ToggleFavoriteResponse`       |
| 11  | `GET`    | `/users/{userId}/favorites/{placeId}/check` | Yes  | —                          | `{ isFavorite }`               |
| 12  | `POST`   | `/users/{userId}/preferences`               | Yes  | `OnboardingPayload`        | `void`                         |
| 13  | `PATCH`  | `/users/{userId}/preferences`               | Yes  | Partial prefs              | `void`                         |
| 14  | `GET`    | `/places/{placeId}`                         | Yes  | —                          | `PlaceDetail`                  |
| 15  | `GET`    | `/places/{placeId}/reviews`                 | Yes  | —                          | `Review[]`                     |
| 16  | `POST`   | `/places/{placeId}/reviews`                 | Yes  | `{ rating, comment }`      | `Review`                       |
| 17  | `GET`    | `/places/{placeId}/social-reviews`          | Yes  | —                          | `SocialMediaReview[]`          |
| 18  | `GET`    | `/places/{placeId}/review-summary`          | Yes  | —                          | `ReviewSummary`                |
| 19  | `GET`    | `/places/{placeId}/similar`                 | Yes  | —                          | `Place[]`                      |
| 20  | `POST`   | `/interactions`                             | Yes  | `RecordInteractionRequest` | `void`                         |
| 21  | `GET`    | `/users/{userId}`                           | Yes  | —                          | `UserProfile`                  |
| 22  | `PUT`    | `/users/{userId}`                           | Yes  | `EditProfileData`          | `UserProfile`                  |
| 23  | `GET`    | `/users/{userId}/preferences`               | Yes  | —                          | `UserPreferences`              |
| 24  | `PUT`    | `/users/{userId}/preferences`               | Yes  | `UpdatePreferencesRequest` | `UserPreferences`              |
| 25  | `GET`    | `/users/{userId}/notifications`             | Yes  | —                          | `NotificationSettings`         |
| 26  | `PUT`    | `/users/{userId}/notifications`             | Yes  | `NotificationSettings`     | `NotificationSettings`         |
| 27  | `GET`    | `/users/{userId}/privacy`                   | Yes  | —                          | `PrivacySettings`              |
| 28  | `PUT`    | `/users/{userId}/privacy`                   | Yes  | `PrivacySettings`          | `PrivacySettings`              |
| 29  | `GET`    | `/users/{userId}/data/export`               | Yes  | —                          | `Blob` (file download)         |
| 30  | `DELETE` | `/users/{userId}/account`                   | Yes  | —                          | `void`                         |

**Total: 30 endpoints across 7 features.**

---

_End of Backend Contract Specification_
