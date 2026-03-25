# Moderator Backend Contract Summary

## Purpose

This contract defines the moderator APIs needed so the current React moderator screens work end-to-end without frontend logic changes.

Business rule aligned with frontend:

- Moderator can approve places
- Moderator can flag places
- Moderator can delete places directly
- Any place flagged by moderator must become visible in admin flagged queue

## Global Response Envelope

All endpoints must return the standard envelope used across frontend:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {}
}
```

Validation/error shape (same standard):

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "title": "One or more validation errors occurred.",
  "errors": {
    "fieldName": ["Error message"]
  },
  "data": null
}
```

---

## 1) Moderator Dashboard

### GET `/api/v1/Moderator/dashboard`

Expected request:

- No body

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Moderator dashboard fetched successfully",
  "data": {
    "stats": {
      "pendingReviews": 12,
      "flaggedPlaces": 3,
      "openReports": 7,
      "resolvedToday": 4,
      "resolvedThisWeek": 18,
      "totalModerated": 342
    },
    "recentActions": [
      {
        "id": "ma1",
        "action": "approved",
        "moderatorName": "Sara Mohamed",
        "itemType": "place",
        "itemName": "New Cafe in Maadi",
        "timestamp": "2026-03-24T10:00:00Z",
        "note": "Looks valid"
      }
    ]
  }
}
```

---

## 2) Reported Content List

### GET `/api/v1/Moderator/reports?type=review|place|user&status=open|investigating|resolved|dismissed&priority=high|medium|low&search=&page=1&count=20`

Expected request:

- Query params are optional except `page` and `count`

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reported content fetched successfully",
  "data": {
    "items": [
      {
        "id": "rpt1",
        "type": "review",
        "reportedItemId": "r3",
        "reportedItemName": "Review on Cairo Jazz Club",
        "reporterName": "Ahmed Khalil",
        "reporterId": 1,
        "reason": "Inappropriate content",
        "description": "This review contains offensive language.",
        "reviewContent": "Bad words...",
        "reviewAuthorName": "Mohamed Nasser",
        "status": "open",
        "priority": "high",
        "createdAt": "2026-03-24T08:30:00Z",
        "resolvedAt": null
      }
    ],
    "pageIndex": 1,
    "pageSize": 20,
    "totalCount": 1,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

---

## 3) Update Report Status

### PATCH `/api/v1/Moderator/reports/{reportId}/status`

Expected request body:

```json
{
  "status": "investigating"
}
```

Allowed status values:

- `open`
- `investigating`
- `resolved`
- `dismissed`

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Report status updated successfully",
  "data": {
    "reportId": "rpt1",
    "status": "investigating",
    "resolvedAt": null
  }
}
```

---

## 4) Delete Review From Report Action

### POST `/api/v1/Moderator/reports/{reportId}/delete-review`

Expected request body (optional note):

```json
{
  "note": "Contains hate speech"
}
```

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review deleted and report resolved",
  "data": {
    "reportId": "rpt1",
    "reviewId": "r3",
    "reportStatus": "resolved",
    "resolvedAt": "2026-03-24T11:25:00Z"
  }
}
```

---

## 5) Warn User From Report Action

### POST `/api/v1/Moderator/reports/{reportId}/warn-user`

Expected request body:

```json
{
  "message": "Your review violates community guidelines.",
  "note": "First warning"
}
```

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Warning sent and report resolved",
  "data": {
    "reportId": "rpt1",
    "userId": "5",
    "reportStatus": "resolved",
    "warningId": "warn_123",
    "resolvedAt": "2026-03-24T11:30:00Z"
  }
}
```

---

## 6) Escalate User Ban Review

### POST `/api/v1/Moderator/reports/{reportId}/escalate-ban`

Expected request body:

```json
{
  "reason": "Repeated violations after warning",
  "evidence": ["review:r3", "review:r8"]
}
```

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ban request escalated to admin and report resolved",
  "data": {
    "reportId": "rpt1",
    "userId": "5",
    "reportStatus": "resolved",
    "adminQueueItemId": "banq_77",
    "resolvedAt": "2026-03-24T11:35:00Z"
  }
}
```

---

## 7) Moderator Places List

### GET `/api/v1/Moderator/places?status=all|pending|flagged|active|removed&search=&page=1&count=20`

Expected request:

- Query params optional except `page` and `count`

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Moderator places fetched successfully",
  "data": {
    "items": [
      {
        "id": "5",
        "name": "New Cafe Pending",
        "category": "Food & Drink",
        "district": "Maadi",
        "rating": 0,
        "reviewCount": 0,
        "status": "pending",
        "createdAt": "2026-03-24T09:00:00Z",
        "image": "https://example.com/p.jpg",
        "tags": ["Casual", "Budget Friendly"],
        "description": "A cozy cafe",
        "priceLevel": "mid_range",
        "phone": "+20 2 1234 5678",
        "website": "https://example.com"
      }
    ],
    "pageIndex": 1,
    "pageSize": 20,
    "totalCount": 1,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

---

## 8) Moderator Add Place

### POST `/api/v1/Moderator/places`

Expected request body:

```json
{
  "name": "Al-Azhar Park",
  "category": "Parks",
  "district": "Nasr City",
  "description": "Large public park with city views and walking tracks.",
  "priceLevel": "mid_range",
  "tags": ["Outdoor", "Family-friendly"],
  "image": "https://example.com/alazhar.jpg",
  "phone": "+20 2 2510 0000",
  "website": "https://example.com/alazhar"
}
```

Expected response:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Place submitted successfully",
  "data": {
    "id": "place_998",
    "name": "Al-Azhar Park",
    "category": "Parks",
    "district": "Nasr City",
    "rating": 0,
    "reviewCount": 0,
    "status": "pending",
    "createdAt": "2026-03-24T12:00:00Z",
    "image": "https://example.com/alazhar.jpg",
    "tags": ["Outdoor", "Family-friendly"],
    "description": "Large public park with city views and walking tracks.",
    "priceLevel": "mid_range",
    "phone": "+20 2 2510 0000",
    "website": "https://example.com/alazhar"
  }
}
```

---

## 9) Moderator Update Place Status

### PATCH `/api/v1/Moderator/places/{placeId}/status`

Expected request body:

```json
{
  "status": "flagged",
  "reason": "Suspicious/fake listing"
}
```

Allowed status values:

- `active`
- `flagged`
- `removed`

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Place status updated successfully",
  "data": {
    "placeId": "5",
    "status": "flagged",
    "flaggedBy": {
      "moderatorId": "mod_1",
      "moderatorName": "Sara Mohamed",
      "flaggedAt": "2026-03-24T12:10:00Z",
      "reason": "Suspicious/fake listing"
    },
    "forwardedToAdmin": true,
    "adminQueueItemId": "plq_901"
  }
}
```

Important behavior:

- When `status = flagged` by moderator, backend must automatically create/admin-link an admin queue record so flagged places appear in admin flagged places workflow.

---

## 10) Moderator Delete Place (Direct Delete)

### DELETE `/api/v1/Moderator/places/{placeId}`

Expected request:

- No body

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Place deleted successfully",
  "data": {
    "placeId": "5",
    "deletedAt": "2026-03-24T12:20:00Z"
  }
}
```

---

## 11) Moderator Categories (for Add Place Form)

### GET `/api/v1/Moderator/categories`

Expected request:

- No body

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "food",
      "label": "Food & Drink",
      "icon": "UtensilsCrossed",
      "count": 124,
      "color": "bg-orange-100",
      "status": "active"
    }
  ]
}
```

---

## 12) Moderator Reviews List

### GET `/api/v1/Moderator/reviews?status=all|pending|flagged|published|removed&search=&page=1&count=20`

Expected request:

- Query params optional except `page` and `count`

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Moderator reviews fetched successfully",
  "data": {
    "items": [
      {
        "id": "r5",
        "userId": "8",
        "userName": "Nour Samir",
        "userAvatar": "https://example.com/u8.jpg",
        "placeId": "1",
        "placeName": "Nile Felucca Experience",
        "rating": 2,
        "comment": "Spam review with external links",
        "status": "pending",
        "reportCount": 3,
        "createdAt": "2026-03-24T09:40:00Z"
      }
    ],
    "pageIndex": 1,
    "pageSize": 20,
    "totalCount": 1,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

---

## 13) Moderator Update Review Status

### PATCH `/api/v1/Moderator/reviews/{reviewId}/status`

Expected request body:

```json
{
  "status": "published"
}
```

Allowed status values:

- `published`
- `flagged`
- `removed`

Expected response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Review status updated successfully",
  "data": {
    "reviewId": "r5",
    "status": "published",
    "updatedAt": "2026-03-24T12:30:00Z"
  }
}
```

---

## Frontend Readiness Checklist (Backend)

When these endpoints are implemented with the above request/response contracts, moderator pages in React can be fully API-driven:

- Dashboard
- Reported content actions
- Place moderation (approve, flag, delete, add)
- Review moderation
- Category loading for place submission
