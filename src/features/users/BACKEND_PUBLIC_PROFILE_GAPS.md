# Backend Gaps for Public Profile Integration

This file documents API/data needs that are not fully covered by the currently provided endpoints.

## Implemented with existing endpoints

1. GET /api/v1/User/profile
- Used for viewing the authenticated current user's profile.

2. GET /api/v1/Review/user/{userId}
- Used for recent review list on public profile pages.
- Used as a fallback source for user name/avatar when dedicated public profile endpoint is unavailable.

## Needed from backend for full public profile support

1. Dedicated public profile endpoint by userId
- Suggested: GET /api/v1/User/{userId}/profile
- Why needed:
  - Current /api/v1/User/profile returns only authenticated user profile.
  - Public profile page route is /users/:id and must load other users too.
  - Review fallback cannot provide full profile when a user has no reviews.

2. Bio support in profile contracts
- Please include bio in:
  - GET /api/v1/User/profile response
  - PUT /api/v1/User/profile request/update contract
  - GET public profile by userId response
- Why needed:
  - Public profile UI already supports and displays bio.
  - Edit profile flow should be able to update bio.

## Optional improvements

1. Include review summary aggregates in profile response
- Example: reviewCount, averageRating.
- This avoids deriving counters from separate endpoints.

2. Include role as readable enum/string in addition to numeric code
- Current frontend maps numeric role values with assumptions.
