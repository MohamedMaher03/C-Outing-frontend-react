# Backend API Summary - Profile Settings

This file lists only the APIs needed for the updated Profile Settings screens.

## 1) Notifications Settings

### GET /api/v1/User/profile/notifications

Purpose: Get current user notification settings.

Response (200):

```json
{
  "push": {
    "recommendations": true,
    "favorites": true,
    "reviews": false,
    "updates": true
  },
  "email": {
    "monthlyDigest": true,
    "promotions": true,
    "tips": true
  }
}
```

### PUT /api/v1/User/profile/notifications

Purpose: Update current user notification settings.

Request body:

```json
{
  "push": {
    "recommendations": true,
    "favorites": true,
    "reviews": true,
    "updates": true
  },
  "email": {
    "monthlyDigest": true,
    "promotions": false,
    "tips": true
  }
}
```

Response (200): return the saved object with same shape.

## 2) Privacy & Data Settings

### GET /api/v1/User/profile/privacy

Purpose: Get current user privacy settings.

Response (200):

```json
{
  "showFavorites": false,
  "showActivity": true,
  "dataCollection": true,
  "personalization": true
}
```

### PUT /api/v1/User/profile/privacy

Purpose: Update current user privacy settings.

Request body:

```json
{
  "showFavorites": true,
  "showActivity": true,
  "dataCollection": true,
  "personalization": false
}
```

Response (200): return the saved object with same shape.

## 3) No backend API needed for these UI changes

- Help & Support contact is now static email: farouqdiaaeldin@gmail.com
- FAQ content is currently static in frontend.
- Removed from UI and not needed now:
  - Messages notification toggle
  - Monthly Newsletter toggle
  - Public Profile and Show Location toggles
  - Download Your Data action
  - Live Chat and Phone Support
  - Resources section

## Notes

- All endpoints are for the authenticated current user (no userId path param needed).
- If your API wrapper uses envelope format, keep frontend mapping consistent.
