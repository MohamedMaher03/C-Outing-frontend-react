# Admin Backend Contract Summary

## Current Admin Dashboard Data Source (in frontend now)

The dashboard currently calls:

1. `GET /api/v1/Admin/stats`
2. `GET /api/v1/Admin/system/health`
3. `GET /api/v1/Admin/venues/reported`

And it calls some of them twice because dashboard has two service methods:

1. `getStats()` calls stats + system-health + reported-venues.
2. `getRecentActivity()` calls stats + system-health again.

So one dashboard load currently makes 5 HTTP requests total.

## Recommended Improvement (better backend design)

Yes, it is better to add one dedicated dashboard endpoint that returns all dashboard data in one response.

### New Endpoint (recommended)

`GET /api/v1/Admin/dashboard`

### Expected Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin dashboard fetched successfully",
  "data": {
    "stats": {
      "totalUsers": 1200,
      "totalVenues": 250,
      "totalReviews": 3200,
      "openReports": 14,
      "activeInteractions": 56,
      "newUsersThisWeek": 32,
      "pendingReviews": 9,
      "resolvedReportsThisWeek": 11
    },
    "systemHealth": {
      "status": "Healthy",
      "timestamp": "2026-03-23T18:35:20.003Z"
    },
    "recentActivity": [
      {
        "id": "string",
        "type": "user_joined",
        "description": "New user joined",
        "timestamp": "2026-03-23T18:35:20.003Z",
        "userId": "string",
        "userName": "string"
      }
    ]
  }
}
```

## Endpoints You Can Remove for Dashboard Usage

If `GET /api/v1/Admin/dashboard` is added, the dashboard page no longer needs to call these separately:

1. `GET /api/v1/Admin/stats` (for dashboard only)
2. `GET /api/v1/Admin/system/health` (for dashboard only)
3. `GET /api/v1/Admin/venues/reported` (for dashboard report count only)

Note: You can keep them for other consumers, but dashboard should use only `/dashboard`.

## Keep These Existing Integrated Endpoints (non-dashboard pages)

1. `GET /api/v1/Admin/users`
2. `PATCH /api/v1/Admin/users/{userId}/ban`
3. `PATCH /api/v1/Admin/users/{userId}/unban`
4. `GET /api/v1/Admin/venues`
5. `DELETE /api/v1/Admin/venues/{venueId}`
6. `DELETE /api/v1/Admin/reviews/{reviewId}`

## Existing Endpoint Adjustments Still Needed

1. `GET /api/v1/Admin/users`

- Clarify role integer enum in API contract.
- Frontend currently assumes:
  - `0 -> user`
  - `2 -> moderator`
  - `3 -> admin`

2. `GET /api/v1/Admin/system/health`

- Prefer camelCase keys for consistency across API:
  - `totalUsers`, `totalVenues`, `totalReviews`, `recentInteractions`, `status`, `timestamp`

3. `GET /api/v1/Admin/venues/reported`

- Prefer paginated response for scalability when list grows.

## Remaining Endpoints Needed to Complete Admin Feature

1. `GET /api/v1/Admin/reviews` (review moderation list)
2. `PATCH /api/v1/Admin/reviews/{reviewId}/status`
3. `POST /api/v1/Admin/venues` (add place)
4. `PATCH /api/v1/Admin/venues/{venueId}/status`
5. `GET /api/v1/Admin/categories`
6. `PATCH /api/v1/Admin/categories/{categoryId}`
7. `GET /api/v1/Admin/settings`
8. `PATCH /api/v1/Admin/settings`

## Frontend Behavior Right Now

1. Admin uses real backend by default.
2. Dashboard data is synthesized from multiple endpoints as described above.
3. Users ban/unban and venue delete are fully real.
4. Add-place, place-status moderation, review moderation list/status, categories write, and settings write still wait for backend endpoints.
