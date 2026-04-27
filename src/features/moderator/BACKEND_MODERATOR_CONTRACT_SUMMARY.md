# Moderator Backend Contract Summary (Mock Parity)

## Objective

This document defines the backend API contract required for the Moderator feature to behave exactly like the current mock-driven frontend.

Scope includes:

- Moderator Dashboard
- Reported Content moderation
- Moderate Places (shared with Admin APIs)
- Moderate Reviews (shared with Admin APIs)

## Global API Rules

## Enums Used by Frontend

### Reported Content

- `type`: `review | place | user`
- `status`: `open | investigating | resolved | dismissed`
- `priority`: `low | medium | high`

### Moderation Actions

- `action`: `approved | removed | warned | escalated`

### Place Moderation

- `status`: `active | pending | flagged | removed`

### Review Moderation

- `status`: `published | pending | flagged | removed`

## Required Endpoints

## A) Moderator-specific Endpoints

### 1. Get Moderator Stats

- Method: `GET`
- Path: `/moderator/stats`
- Used by: Moderator Dashboard

Success `data` shape:

```json
{
  "pendingReviews": 12,
  "flaggedPlaces": 3,
  "openReports": 7,
  "resolvedToday": 4,
  "resolvedThisWeek": 18,
  "totalModerated": 342
}
```

### 2. Get Recent Moderator Actions

- Method: `GET`
- Path: `/moderator/actions`
- Used by: Moderator Dashboard

Success `data` shape:

```json
[
  {
    "id": "ma1",
    "action": "removed",
    "moderatorName": "Sara Mohamed",
    "itemType": "review",
    "itemName": "Spam review on Zooba",
    "timestamp": "2026-03-03T10:00:00Z",
    "note": "optional"
  }
]
```

### 3. Get Reported Content Queue

- Method: `GET`
- Path: `/moderator/reports`
- Used by: Reported Content page

Success `data` shape:

```json
[
  {
    "id": "rpt1",
    "type": "review",
    "reportedItemId": "r3",
    "reportedItemName": "Review on Cairo Jazz Club",
    "reporterName": "Ahmed Khalil",
    "reporterId": 1,
    "reason": "Inappropriate content",
    "description": "This review contains offensive language.",
    "reviewContent": "optional - only for type=review",
    "reviewAuthorName": "optional - only for type=review",
    "status": "open",
    "priority": "high",
    "createdAt": "2026-03-02T14:20:00Z",
    "resolvedAt": "optional ISO date"
  }
]
```

### 4. Update Report Status

- Method: `PATCH`
- Path: `/moderator/reports/{reportId}/status`
- Used by: Reported Content page (Investigate, Dismiss, Mark Resolved)

Request body:

```json
{
  "status": "investigating"
}
```

Allowed status values: `open | investigating | resolved | dismissed`

Success response:

- Preferred: `200` with updated report in `data`
- Also acceptable: `204 No Content`

### 5. Delete Reported Review (Resolution Action)

- Method: `POST`
- Path: `/moderator/reports/{reportId}/delete-review`
- Used by: Reported Content page action button
- Request body: none

Success response:

- Preferred: `200` or `204`
- Frontend behavior after success: marks report as resolved locally

### 6. Warn User (Resolution Action)

- Method: `POST`
- Path: `/moderator/reports/{reportId}/warn`
- Used by: Reported Content page action button
- Request body: none

Success response:

- Preferred: `200` or `204`
- Frontend behavior after success: marks report as resolved locally

### 7. Escalate User for Ban Review (Resolution Action)

- Method: `POST`
- Path: `/moderator/reports/{reportId}/ban`
- Used by: Reported Content page action button
- Request body: none

Success response:

- Preferred: `200` or `204`
- Frontend behavior after success: marks report as resolved locally

## B) Shared Admin Endpoints Required by Moderator Places/Reviews

These are called from moderator flow through `moderatorService -> adminService`.

### 8. Get Venues List (for Moderate Places)

- Method: `GET`
- Path: `/api/v1/Admin/venues`
- Query: `page` (default `1`), `count` (default `100`)
- Used by: Moderate Places page list

Success `data` shape (paginated):

```json
{
  "items": [
    {
      "id": "venue-id",
      "name": "Venue name",
      "location": "full address or short location",
      "category": "Cafe",
      "district": "Maadi",
      "type": "Cafe",
      "priceRange": 3,
      "latitude": 30.0,
      "longitude": 31.0,
      "averageRating": 4.4,
      "reviewCount": 120,
      "displayImageUrl": "https://...",
      "thumbnailUrl": "https://...",
      "isOpen": true,
      "atmosphereTags": ["Cozy", "Quiet"],
      "hasWifi": true,
      "isSaved": false
    }
  ],
  "pageIndex": 0,
  "pageSize": 100,
  "totalCount": 1,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

Notes:

- Frontend computes moderator place status from endpoint #9:
  - if venue id in reported set -> `flagged`
  - else -> `active`

### 9. Get Reported Venues (for flagged mapping)

- Method: `GET`
- Path: `/api/v1/Admin/venues/reported`
- Used by: Moderate Places status mapping

Current expected `data` shape:

```json
[
  {
    "id": "venue-id",
    "name": "Venue name"
  }
]
```

Important:

- Frontend currently only uses `id` from this response.

### 10. Delete Venue

- Method: `DELETE`
- Path: `/api/v1/Admin/venues/{venueId}`
- Used by: Moderate Places "Delete"
- Request body: none

Success response:

- `204` preferred

### 11. Create Venue (Needed for Add Place)

- Method: `POST`
- Path: `/api/v1/Admin/venues`
- Used by: Moderate Places "Submit Place"

Request body expected from frontend:

```json
{
  "name": "Al-Azhar Park",
  "category": "Park",
  "district": "El Darb El Ahmar",
  "image": "https://images.example.com/place.jpg",
  "tags": ["Family", "Outdoor"],
  "description": "Large public park with city views...",
  "priceLevel": "mid_range",
  "phone": "+20 2 1234 5678",
  "website": "https://example.com"
}
```

`priceLevel` enum expected:

- `cheapest | cheap | midrange | expensive | luxury`

Success response `data` should include at least:

```json
{
  "id": "new-venue-id",
  "name": "Al-Azhar Park",
  "category": "Park",
  "district": "El Darb El Ahmar",
  "rating": 0,
  "reviewCount": 0,
  "status": "pending",
  "createdAt": "2026-03-31T12:00:00Z",
  "image": "https://images.example.com/place.jpg",
  "tags": ["Family", "Outdoor"],
  "description": "Large public park with city views...",
  "priceLevel": "mid_range",
  "phone": "+20 2 1234 5678",
  "website": "https://example.com"
}
```

### 12. Update Venue Moderation Status (Needed)

- Method: `PATCH`
- Path: `/api/v1/Admin/venues/{venueId}/status`
- Used by: Moderate Places Approve/Flag actions

Request body:

```json
{
  "status": "active"
}
```

Allowed status values: `active | pending | flagged | removed`

Success response:

- `200` or `204`

### 13. Get Categories (Needed)

- Method: `GET`
- Path: `/api/v1/Admin/categories`
- Used by: Add Place form category dropdown

Success `data` shape:

```json
[
  {
    "id": "cafes",
    "label": "Cafes",
    "icon": "MapPin",
    "count": 42,
    "color": "bg-slate-100",
    "status": "active"
  }
]
```

### 14. Get Reviews List (Needed for Moderate Reviews)

- Method: `GET`
- Path: `/api/v1/Admin/reviews`
- Query suggestion: `page`, `count`, `status`, `searchTerm`
- Used by: Moderate Reviews list

Success `data` shape (array or paginated items):

```json
[
  {
    "id": "review-id",
    "userId": "user-id",
    "userName": "User Name",
    "userAvatar": "https://...",
    "placeId": "venue-id",
    "placeName": "Venue Name",
    "rating": 4,
    "comment": "Great place",
    "status": "pending",
    "reportCount": 2,
    "createdAt": "2026-03-31T09:00:00Z"
  }
]
```

### 15. Update Review Moderation Status (Needed)

- Method: `PATCH`
- Path: `/api/v1/Admin/reviews/{reviewId}/status`
- Used by: Moderate Reviews Approve/Flag/Reject

Request body:

```json
{
  "status": "published"
}
```

Allowed status values: `published | pending | flagged | removed`

Success response:

- `200` or `204`

## Backend Delivery Checklist

To make moderator UI work with APIs exactly like mocks, backend must provide:

1. `GET /moderator/stats`
2. `GET /moderator/actions`
3. `GET /moderator/reports`
4. `PATCH /moderator/reports/{reportId}/status`
5. `POST /moderator/reports/{reportId}/delete-review`
6. `POST /moderator/reports/{reportId}/warn`
7. `POST /moderator/reports/{reportId}/ban`
8. `GET /api/v1/Admin/venues`
9. `GET /api/v1/Admin/venues/reported`
10. `DELETE /api/v1/Admin/venues/{venueId}`
11. `POST /api/v1/Admin/venues`
12. `PATCH /api/v1/Admin/venues/{venueId}/status`
13. `GET /api/v1/Admin/categories`
14. `GET /api/v1/Admin/reviews`
15. `PATCH /api/v1/Admin/reviews/{reviewId}/status`

## Current Frontend Gap Notes

Some moderator flows still depend on admin API methods that are currently marked TODO in the frontend API layer (`addPlace`, `updatePlaceStatus`, `getReviews`, `updateReviewStatus`).

This contract allows backend to implement the routes now. After backend delivery, frontend should wire these TODO methods to real HTTP calls so all moderator actions become fully API-driven.
