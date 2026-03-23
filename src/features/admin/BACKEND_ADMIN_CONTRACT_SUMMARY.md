# Admin Backend Contract Summary

## Integrated Endpoints (now used by frontend)

1. `GET /api/v1/Admin/stats`

- Used for admin dashboard totals.
- Frontend mapping:
  - `totalUsers` -> `totalUsers`
  - `totalVenues` -> `totalPlaces`
  - `activeInteractions` -> `activeUsersToday`
  - `topCategories` -> dashboard activity summary

2. `GET /api/v1/Admin/system/health`

- Used for system status and review totals.
- Frontend mapping:
  - `TotalReviews` -> `totalReviews`
  - `Status` -> `systemStatus`
  - `Timestamp` -> `healthTimestamp`

3. `GET /api/v1/Admin/users`

- Used for users management list.
- Frontend supports query params:
  - `SearchTerm`, `Role`, `IsBanned`, `page`, `count`
- Current frontend call uses `page=1`, `count=100`.

4. `PATCH /api/v1/Admin/users/{userId}/ban`

- Used to ban user in admin users page.

5. `PATCH /api/v1/Admin/users/{userId}/unban`

- Used to restore user (active status).

6. `GET /api/v1/Admin/venues`

- Used for places management list.
- Frontend currently calls with `page=1`, `count=100`.

7. `GET /api/v1/Admin/venues/reported`

- Used to flag reported venues in places list and to compute open reports count.

8. `DELETE /api/v1/Admin/venues/{venueId}`

- Used for deleting venue from places page.

9. `DELETE /api/v1/Admin/reviews/{reviewId}`

- Endpoint kept in API layer, but currently not fully actionable in UI because backend does not provide admin review listing endpoint.

## Changes Needed in Existing Endpoints

1. `GET /api/v1/Admin/users`

- Clarify role integer enum in API docs and contract.
- Frontend assumption today:
  - `0 -> user`
  - `2 -> moderator`
  - `3 -> admin`
- If backend uses another mapping, frontend role badges will be wrong.

2. `GET /api/v1/Admin/system/health`

- Current payload uses PascalCase keys while other endpoints use camelCase.
- Recommended to align with camelCase for consistency:
  - `totalUsers`, `totalVenues`, `totalReviews`, `recentInteractions`, `status`, `timestamp`

3. `GET /api/v1/Admin/venues/reported`

- Should ideally return paginated envelope like `venues` endpoint for scalability.
- Current array response is fine for now but may become heavy with large data.

## New Endpoints Needed (to complete admin feature)

1. Review moderation list

- `GET /api/v1/Admin/reviews`
- Query params: `searchTerm?`, `status?`, `page=1`, `count=10`
- Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reviews fetched successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userName": "string",
        "userAvatarUrl": "string | null",
        "venueId": "uuid",
        "venueName": "string",
        "rating": 4,
        "comment": "string",
        "status": "published",
        "reportCount": 2,
        "createdAt": "2026-03-23T18:35:20.003Z"
      }
    ],
    "pageIndex": 1,
    "pageSize": 10,
    "totalCount": 1,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

2. Review moderation status update

- `PATCH /api/v1/Admin/reviews/{reviewId}/status`
- Request:

```json
{
  "status": "published"
}
```

- Allowed statuses: `published`, `pending`, `flagged`, `removed`.

3. Venue create (admin add place)

- `POST /api/v1/Admin/venues`
- Request:

```json
{
  "name": "string",
  "category": "string",
  "district": "string",
  "description": "string",
  "whyRecommend": "string",
  "priceRange": 3,
  "atmosphereTags": ["family", "cozy"],
  "imageUrl": "string",
  "phone": "string",
  "website": "string"
}
```

- Response: created venue in standard envelope.

4. Venue moderation status update

- `PATCH /api/v1/Admin/venues/{venueId}/status`
- Request:

```json
{
  "status": "active"
}
```

- Allowed statuses: `active`, `pending`, `flagged`, `removed`.

5. Categories management

- `GET /api/v1/Admin/categories`
- `PATCH /api/v1/Admin/categories/{categoryId}`
- Optional: `POST /api/v1/Admin/categories`

Suggested category DTO:

```json
{
  "id": "string",
  "label": "string",
  "icon": "string",
  "count": 0,
  "status": "active"
}
```

6. System settings management

- `GET /api/v1/Admin/settings`
- `PATCH /api/v1/Admin/settings`

Suggested settings DTO:

```json
{
  "siteName": "C-Outing",
  "maintenanceMode": false,
  "maxUploadSize": 5,
  "defaultLanguage": "en",
  "enableNotifications": true,
  "enableReviews": true,
  "moderationRequired": true,
  "autoFlagThreshold": 3
}
```

7. Optional but useful: dashboard activity feed

- `GET /api/v1/Admin/activity`
- If provided, frontend can replace synthesized activity entries with real audit trail.

## Frontend Behavior Notes After Integration

1. Admin feature now defaults to real backend (`VITE_ADMIN_USE_MOCKS` defaults to false when not provided).
2. Users page role editing and suspend action are removed from backend calls (only ban/unban are real).
3. Places delete is fully real.
4. Places status update and add-place operations now show clear unsupported messages until backend endpoints are added.
5. Dashboard activity is currently synthesized from stats + health since no activity endpoint exists.
