# Event Management System - API Documentation

Version: 1.0
Base URL: `https://your-domain.com/api/v1`

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Events](#events-endpoints)
  - [Registrations](#registrations-endpoints)
  - [Tags](#tags-endpoints)
  - [Media Upload](#media-upload-endpoints)
  - [User Profile](#user-profile-endpoints)
  - [Posts & Feed](#posts--feed-endpoints)
  - [Venues](#venues-endpoints)
  - [Schedule](#schedule-endpoints)
  - [Admin](#admin-endpoints)

---

## Overview

This API provides comprehensive event management functionality including user registration, event browsing, QR code check-ins, social feed features, and administrative controls.

### Key Features

- JWT-based authentication with refresh tokens
- Event browsing and registration
- QR code generation for check-ins
- Calendar integration (Google Calendar + ICS)
- Social feed with posts and comments
- Real-time schedule management
- Admin controls for event and user management

---

## Authentication

The API uses JWT (JSON Web Token) for authentication. Tokens are issued during login and must be included in subsequent requests.

### Token Types

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (30 days), used to obtain new access tokens

### Using Authentication

Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message description",
  "details": [] // Optional validation details
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (duplicate resource)
- `429` - Too many requests (rate limit exceeded)
- `500` - Internal server error

---

## Rate Limiting

The following endpoints have rate limits:

| Endpoint Type | Limit       | Window     |
| ------------- | ----------- | ---------- |
| OTP requests  | 3 requests  | 15 minutes |
| Login         | 5 requests  | 15 minutes |
| File upload   | 10 requests | 5 minutes  |

When rate limit is exceeded, you'll receive a `429` status code.

---

## Endpoints

### Authentication Endpoints

#### 1. Start Registration (Request OTP)

Start the registration process by requesting an OTP sent to email.

**Endpoint:** `POST /auth/register/start`

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`

```json
{
  "message": "OTP sent to your email. Please check your inbox.",
  "expiresIn": 900
}
```

**Errors:**

- `400` - Validation failed
- `409` - Email or username already registered
- `429` - Too many OTP requests

---

#### 2. Verify Registration (Complete Registration)

Complete registration by verifying the OTP sent to email.

**Endpoint:** `POST /auth/register/verify`

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "username": "johndoe",
  "password": "SecurePassword123!"
}
```

**Response:** `201 Created`

```json
{
  "message": "Account created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**

- `400` - Invalid or expired OTP
- `409` - Email or username already registered

---

#### 3. Login

Authenticate and receive access and refresh tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_string",
  "expiresIn": 900,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER"
  }
}
```

**Errors:**

- `401` - Invalid email or password
- `403` - Email not verified
- `429` - Too many login attempts

---

#### 4. Refresh Token

Obtain a new access token using a refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response:** `200 OK`

```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 900
}
```

**Errors:**

- `401` - Invalid or expired refresh token

---

### Events Endpoints

#### 5. List Events

Get a paginated list of events.

**Endpoint:** `GET /events`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional, admin only): DRAFT | PUBLISHED | ARCHIVED
- `visibility` (optional, admin only): PUBLIC | PRIVATE
- `search` (optional): Search in title and description
- `tagIds` (optional): Filter by tag IDs (can be multiple)

**Example:** `GET /events?page=1&limit=10&search=tech&tagIds=tag1&tagIds=tag2`

**Authentication:** Optional (public events visible to all, admins see all events)

**Response:** `200 OK`

```json
{
  "events": [
    {
      "id": "event_id",
      "title": "Tech Conference 2024",
      "slug": "tech-conference-2024",
      "description": "Annual technology conference",
      "startTime": "2024-06-01T09:00:00.000Z",
      "endTime": "2024-06-01T17:00:00.000Z",
      "timezone": "America/New_York",
      "venue": "Convention Center",
      "latitude": 40.7128,
      "longitude": -74.006,
      "capacity": 500,
      "bannerPath": "/uploads/banner.jpg",
      "status": "PUBLISHED",
      "visibility": "PUBLIC",
      "enableFeed": true,
      "requirePostModeration": false,
      "tags": [
        {
          "id": "tag_id",
          "name": "Technology",
          "slug": "technology"
        }
      ],
      "confirmedCount": 250,
      "availableSeats": 250
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

#### 6. Get Event Details

Get detailed information about a specific event.

**Endpoint:** `GET /events/{slug}`

**Authentication:** Optional (required for unpublished/private events)

**Response:** `200 OK`

```json
{
  "event": {
    "id": "event_id",
    "title": "Tech Conference 2024",
    "slug": "tech-conference-2024",
    "description": "Annual technology conference",
    "startTime": "2024-06-01T09:00:00.000Z",
    "endTime": "2024-06-01T17:00:00.000Z",
    "timezone": "America/New_York",
    "venue": "Convention Center",
    "latitude": 40.7128,
    "longitude": -74.006,
    "capacity": 500,
    "bannerPath": "/uploads/banner.jpg",
    "status": "PUBLISHED",
    "visibility": "PUBLIC",
    "enableFeed": true,
    "requirePostModeration": false,
    "tags": [
      {
        "id": "tag_id",
        "name": "Technology",
        "slug": "technology"
      }
    ],
    "confirmedCount": 250,
    "availableSeats": 250
  }
}
```

**Errors:**

- `404` - Event not found

---

#### 7. Create Event (Admin Only)

Create a new event.

**Endpoint:** `POST /events`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "title": "Tech Conference 2024",
  "slug": "tech-conference-2024",
  "description": "Annual technology conference",
  "startTime": "2024-06-01T09:00:00.000Z",
  "endTime": "2024-06-01T17:00:00.000Z",
  "timezone": "America/New_York",
  "venue": "Convention Center",
  "latitude": 40.7128,
  "longitude": -74.006,
  "capacity": 500,
  "bannerPath": "/uploads/banner.jpg",
  "status": "DRAFT",
  "visibility": "PUBLIC",
  "enableFeed": true,
  "requirePostModeration": false,
  "tagIds": ["tag_id_1", "tag_id_2"]
}
```

**Response:** `201 Created`

```json
{
  "message": "Event created successfully",
  "event": {
    /* event object */
  }
}
```

**Errors:**

- `400` - Validation failed or end time before start time
- `401` - Unauthorized
- `403` - Admin access required
- `409` - Event slug already exists

---

#### 8. Update Event (Admin Only)

Update an existing event.

**Endpoint:** `PATCH /events/{slug}`

**Authentication:** Required (Admin only)

**Request Body:** (all fields optional)

```json
{
  "title": "Updated Title",
  "capacity": 600,
  "status": "PUBLISHED"
}
```

**Response:** `200 OK`

```json
{
  "message": "Event updated successfully",
  "event": {
    /* updated event object */
  }
}
```

**Errors:**

- `400` - Validation failed
- `401` - Unauthorized
- `403` - Admin access required
- `404` - Event not found
- `409` - Slug already exists (if updating slug)

---

#### 9. Delete Event (Admin Only)

Delete an event (cascades to registrations and tags).

**Endpoint:** `DELETE /events/{slug}`

**Authentication:** Required (Admin only)

**Response:** `200 OK`

```json
{
  "message": "Event deleted successfully"
}
```

**Errors:**

- `401` - Unauthorized
- `403` - Admin access required
- `404` - Event not found

---

#### 10. Publish Event (Admin Only)

Publish a draft event.

**Endpoint:** `POST /events/{slug}/publish`

**Authentication:** Required (Admin only)

**Response:** `200 OK`

```json
{
  "message": "Event published successfully",
  "event": {
    /* event object */
  }
}
```

---

#### 11. Unpublish Event (Admin Only)

Unpublish a published event.

**Endpoint:** `POST /events/{slug}/unpublish`

**Authentication:** Required (Admin only)

**Response:** `200 OK`

```json
{
  "message": "Event unpublished successfully",
  "event": {
    /* event object */
  }
}
```

---

#### 12. Register for Event (Public)

Public registration endpoint that creates user account if needed.

**Endpoint:** `POST /events/{slug}/register`

**Authentication:** Not required

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "company": "Tech Corp",
  "department": "Engineering",
  "designation": "Software Engineer",
  "specialization": "Backend Development",
  "experienceYears": 5
}
```

**Response:** `201 Created`

```json
{
  "message": "Registration confirmed",
  "registration": {
    "id": "registration_id",
    "status": "CONFIRMED",
    "qrToken": "unique_qr_token",
    "qrCodeDataUrl": "data:image/png;base64,...",
    "googleCalendarLink": "https://calendar.google.com/calendar/render?...",
    "event": {
      "id": "event_id",
      "title": "Tech Conference 2024",
      "slug": "tech-conference-2024",
      "startTime": "2024-06-01T09:00:00.000Z",
      "endTime": "2024-06-01T17:00:00.000Z",
      "venue": "Convention Center"
    }
  },
  "credentials": {
    "email": "john@example.com",
    "password": "auto_generated_password"
  }
}
```

**Notes:**

- If user doesn't exist, account is created automatically
- If new user is created, auto-generated credentials are returned
- QR code and ICS file are sent via email
- Status can be CONFIRMED or WAITLISTED based on capacity

**Errors:**

- `400` - Missing required fields or event not available
- `404` - Event not found
- `409` - Already registered

---

#### 13. Export Event Registrations (Admin Only)

Export event registrations as CSV.

**Endpoint:** `GET /events/{slug}/export`

**Authentication:** Required (Admin only)

**Response:** CSV file download

---

#### 14. Get Event Calendar Link

Get calendar integration links for an event.

**Endpoint:** `GET /events/{slug}/calendar`

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "googleCalendarLink": "https://calendar.google.com/calendar/render?...",
  "icsDownloadUrl": "/api/v1/events/{slug}/calendar/download"
}
```

---

### Registrations Endpoints

#### 15. Create Registration (Authenticated)

Register for an event (requires authentication).

**Endpoint:** `POST /registrations`

**Authentication:** Required

**Request Body:**

```json
{
  "eventId": "event_id"
}
```

**Response:** `201 Created`

```json
{
  "message": "Registration confirmed",
  "registration": {
    "id": "registration_id",
    "status": "CONFIRMED",
    "qrToken": "unique_qr_token",
    "qrCodeDataUrl": "data:image/png;base64,...",
    "googleCalendarLink": "https://calendar.google.com/calendar/render?...",
    "event": {
      "id": "event_id",
      "title": "Tech Conference 2024",
      "slug": "tech-conference-2024",
      "startTime": "2024-06-01T09:00:00.000Z",
      "endTime": "2024-06-01T17:00:00.000Z",
      "venue": "Convention Center"
    }
  }
}
```

**Errors:**

- `400` - Event not available for registration
- `401` - Unauthorized
- `404` - Event not found
- `409` - Already registered

---

#### 16. Check-In Registration (Admin Only)

Check-in an attendee using QR token.

**Endpoint:** `POST /registrations/checkin`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "qrToken": "unique_qr_token"
}
```

**Response:** `200 OK`

```json
{
  "message": "Check-in successful",
  "registration": {
    "id": "registration_id",
    "status": "CHECKED_IN",
    "checkedInAt": "2024-06-01T08:30:00.000Z",
    "user": {
      "username": "johndoe",
      "email": "john@example.com"
    },
    "event": {
      "title": "Tech Conference 2024",
      "startTime": "2024-06-01T09:00:00.000Z"
    }
  }
}
```

**Errors:**

- `400` - Cannot check in (already checked in or not confirmed)
- `401` - Unauthorized
- `403` - Admin access required
- `404` - Invalid QR token

---

#### 17. Cancel Registration

Cancel a registration.

**Endpoint:** `POST /registrations/{id}/cancel`

**Authentication:** Required (user or admin)

**Response:** `200 OK`

```json
{
  "message": "Registration cancelled successfully",
  "registration": {
    /* updated registration */
  }
}
```

**Notes:**

- If a confirmed registration is cancelled, first waitlisted user is promoted
- Cannot cancel after check-in

**Errors:**

- `400` - Already cancelled or checked in
- `401` - Unauthorized
- `403` - Not your registration
- `404` - Registration not found

---

#### 18. Get User's Registrations

Get all registrations for the authenticated user.

**Endpoint:** `GET /me/registrations`

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "registrations": [
    {
      "id": "registration_id",
      "status": "CONFIRMED",
      "qrToken": "unique_qr_token",
      "checkedInAt": null,
      "createdAt": "2024-05-01T10:00:00.000Z",
      "event": {
        "id": "event_id",
        "title": "Tech Conference 2024",
        "slug": "tech-conference-2024",
        "description": "Annual technology conference",
        "startTime": "2024-06-01T09:00:00.000Z",
        "endTime": "2024-06-01T17:00:00.000Z",
        "venue": "Convention Center",
        "bannerPath": "/uploads/banner.jpg",
        "tags": [
          {
            "id": "tag_id",
            "name": "Technology",
            "slug": "technology"
          }
        ]
      }
    }
  ]
}
```

**Errors:**

- `401` - Unauthorized

---

### Tags Endpoints

#### 19. List Tags

Get all available tags.

**Endpoint:** `GET /tags`

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "tags": [
    {
      "id": "tag_id",
      "name": "Technology",
      "slug": "technology",
      "eventCount": 15
    }
  ]
}
```

---

#### 20. Create Tag (Admin Only)

Create a new tag.

**Endpoint:** `POST /tags`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "name": "Technology",
  "slug": "technology"
}
```

**Response:** `201 Created`

```json
{
  "message": "Tag created successfully",
  "tag": {
    "id": "tag_id",
    "name": "Technology",
    "slug": "technology"
  }
}
```

**Errors:**

- `401` - Unauthorized
- `403` - Admin access required
- `409` - Tag name or slug already exists

---

### Media Upload Endpoints

#### 21. Upload Media (Admin Only)

Upload images for event banners.

**Endpoint:** `POST /media/upload`

**Authentication:** Required (Admin only)

**Content-Type:** `multipart/form-data`

**Request Body:**

- `file`: Image file (JPG, PNG, WEBP, max 5MB)

**Response:** `200 OK`

```json
{
  "message": "File uploaded successfully",
  "url": "/uploads/uuid-filename.jpg",
  "filename": "uuid-filename.jpg"
}
```

**Errors:**

- `400` - Invalid file type or size
- `401` - Unauthorized
- `403` - Admin access required
- `429` - Too many upload requests

---

### User Profile Endpoints

_(Note: These endpoints use web session authentication currently)_

---

### Posts & Feed Endpoints

#### 22. Create Post

Create a post in an event feed.

**Endpoint:** `POST /posts`

**Authentication:** Required (must be registered for event)

**Request Body:**

```json
{
  "eventId": "event_id",
  "content": "Great session on AI!"
}
```

**Response:** `201 Created`

```json
{
  "message": "Post created successfully",
  "post": {
    "id": "post_id",
    "userId": "user_id",
    "eventId": "event_id",
    "content": "Great session on AI!",
    "status": "APPROVED",
    "createdAt": "2024-06-01T10:00:00.000Z",
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "company": "Tech Corp",
      "designation": "Software Engineer"
    }
  }
}
```

**Notes:**

- If event requires moderation, status will be PENDING
- Only registered attendees can post

**Errors:**

- `400` - Missing content or event ID
- `401` - Unauthorized
- `403` - Not registered for event or feed disabled
- `404` - Event not found

---

#### 23. React to Post

Add a reaction (like) to a post.

**Endpoint:** `POST /posts/react`

**Authentication:** Required

**Request Body:**

```json
{
  "postId": "post_id",
  "type": "LIKE"
}
```

**Response:** `200 OK`

```json
{
  "message": "Reaction added successfully",
  "reaction": {
    "id": "reaction_id",
    "postId": "post_id",
    "userId": "user_id",
    "type": "LIKE"
  }
}
```

---

#### 24. Get Post Comments

Get comments for a post.

**Endpoint:** `GET /posts/{postId}/comments`

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "comments": [
    {
      "id": "comment_id",
      "postId": "post_id",
      "userId": "user_id",
      "content": "Thanks for sharing!",
      "createdAt": "2024-06-01T10:05:00.000Z",
      "user": {
        "id": "user_id",
        "username": "janedoe",
        "email": "jane@example.com",
        "company": "Tech Inc",
        "designation": "Product Manager"
      }
    }
  ]
}
```

---

#### 25. Add Comment to Post

Add a comment to a post.

**Endpoint:** `POST /posts/{postId}/comments`

**Authentication:** Required (must be registered for event)

**Request Body:**

```json
{
  "content": "Thanks for sharing!"
}
```

**Response:** `201 Created`

```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": "comment_id",
    "postId": "post_id",
    "userId": "user_id",
    "content": "Thanks for sharing!",
    "createdAt": "2024-06-01T10:05:00.000Z",
    "user": {
      "id": "user_id",
      "username": "janedoe",
      "email": "jane@example.com",
      "company": "Tech Inc",
      "designation": "Product Manager"
    }
  }
}
```

**Errors:**

- `400` - Missing content
- `401` - Unauthorized
- `403` - Not registered for event
- `404` - Post not found

---

#### 26. Delete Post (Admin Only)

Delete a specific post.

**Endpoint:** `DELETE /posts/{postId}`

**Authentication:** Required (Admin only)

**Response:** `200 OK`

```json
{
  "message": "Post deleted successfully"
}
```

---

#### 27. Moderate Post (Admin Only)

Approve or reject a post.

**Endpoint:** `POST /posts/{postId}/moderate`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "action": "approve"
}
```

**Response:** `200 OK`

```json
{
  "message": "Post approved successfully",
  "post": {
    /* updated post */
  }
}
```

---

### Venues Endpoints

#### 28. List Venues

Get all venues.

**Endpoint:** `GET /venues`

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "venues": [
    {
      "id": "venue_id",
      "name": "Convention Center",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA",
      "latitude": 40.7128,
      "longitude": -74.006,
      "capacity": 1000,
      "description": "Modern convention center",
      "parking": "Available on-site",
      "publicTransport": "Subway line A, B, C",
      "contactEmail": "info@conventioncenter.com",
      "contactPhone": "+1-555-0123",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 29. Create Venue (Admin Only)

Create a new venue.

**Endpoint:** `POST /venues`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "name": "Convention Center",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "latitude": 40.7128,
  "longitude": -74.006,
  "capacity": 1000,
  "description": "Modern convention center",
  "parking": "Available on-site",
  "publicTransport": "Subway line A, B, C",
  "contactEmail": "info@conventioncenter.com",
  "contactPhone": "+1-555-0123"
}
```

**Response:** `201 Created`

```json
{
  "message": "Venue created successfully",
  "venue": {
    /* venue object */
  }
}
```

**Errors:**

- `400` - Missing required fields
- `401` - Unauthorized
- `403` - Admin access required

---

### Schedule Endpoints

#### 30. Get Event Schedule

Get schedule items for an event.

**Endpoint:** `GET /events/{slug}/schedule`

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "scheduleItems": [
    {
      "id": "item_id",
      "eventId": "event_id",
      "title": "Opening Keynote",
      "description": "Welcome and overview",
      "speaker": "John Smith",
      "startTime": "2024-06-01T09:00:00.000Z",
      "endTime": "2024-06-01T10:00:00.000Z",
      "location": "Main Hall",
      "type": "keynote",
      "order": 1
    }
  ]
}
```

---

#### 31. Create Schedule Item (Admin Only)

Add a schedule item to an event.

**Endpoint:** `POST /events/{slug}/schedule`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "title": "Opening Keynote",
  "description": "Welcome and overview",
  "speaker": "John Smith",
  "startTime": "2024-06-01T09:00:00.000Z",
  "endTime": "2024-06-01T10:00:00.000Z",
  "location": "Main Hall",
  "type": "keynote"
}
```

**Response:** `201 Created`

```json
{
  "scheduleItem": {
    /* schedule item object */
  }
}
```

**Errors:**

- `400` - Missing required fields
- `401` - Unauthorized
- `403` - Admin access required
- `404` - Event not found

---

#### 32. Update Schedule Item (Admin Only)

Update a schedule item.

**Endpoint:** `PATCH /events/{slug}/schedule/{itemId}`

**Authentication:** Required (Admin only)

**Request Body:** (all fields optional)

```json
{
  "title": "Updated Keynote Title",
  "startTime": "2024-06-01T09:30:00.000Z"
}
```

**Response:** `200 OK`

```json
{
  "scheduleItem": {
    /* updated schedule item */
  }
}
```

---

#### 33. Delete Schedule Item (Admin Only)

Delete a schedule item.

**Endpoint:** `DELETE /events/{slug}/schedule/{itemId}`

**Authentication:** Required (Admin only)

**Response:** `200 OK`

```json
{
  "message": "Schedule item deleted successfully"
}
```

---

### Admin Endpoints

#### 34. Get All Registrations (Admin Only)

Get all registrations across all events.

**Endpoint:** `GET /admin/registrations`

**Authentication:** Required (Admin only)

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `eventId` (optional): Filter by event
- `status` (optional): Filter by status

**Response:** `200 OK`

```json
{
  "registrations": [
    {
      "id": "registration_id",
      "status": "CONFIRMED",
      "checkedInAt": null,
      "user": {
        "username": "johndoe",
        "email": "john@example.com"
      },
      "event": {
        "title": "Tech Conference 2024",
        "startTime": "2024-06-01T09:00:00.000Z"
      }
    }
  ],
  "pagination": {
    /* pagination info */
  }
}
```

---

#### 35. Get Recent Check-ins (Admin Only)

Get recent check-ins for monitoring.

**Endpoint:** `GET /admin/recent-checkins`

**Authentication:** Required (Admin only)

**Query Parameters:**

- `limit` (optional): Number of recent check-ins (default: 10)

**Response:** `200 OK`

```json
{
  "checkins": [
    {
      "id": "registration_id",
      "checkedInAt": "2024-06-01T08:30:00.000Z",
      "user": {
        "username": "johndoe",
        "email": "john@example.com"
      },
      "event": {
        "title": "Tech Conference 2024"
      }
    }
  ]
}
```

---

#### 36. Get Admin Posts (Admin Only)

Get all posts (including pending moderation).

**Endpoint:** `GET /admin/posts`

**Authentication:** Required (Admin only)

**Query Parameters:**

- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED)
- `eventId` (optional): Filter by event

**Response:** `200 OK`

```json
{
  "posts": [
    {
      "id": "post_id",
      "content": "Post content",
      "status": "PENDING",
      "createdAt": "2024-06-01T10:00:00.000Z",
      "user": {
        /* user info */
      },
      "event": {
        /* event info */
      }
    }
  ]
}
```

---

## Best Practices

### 1. Token Management

- Store access tokens securely (encrypted storage)
- Store refresh tokens in secure storage (keychain/keystore)
- Implement automatic token refresh before expiration
- Clear tokens on logout

### 2. Error Handling

- Always check response status codes
- Parse error messages for user-friendly display
- Implement retry logic for network failures
- Handle rate limiting gracefully

### 3. Performance

- Implement pagination for large lists
- Cache event lists locally
- Use conditional requests (ETags) when possible
- Compress request/response bodies

### 4. Security

- Always use HTTPS in production
- Never log sensitive data (tokens, passwords)
- Validate all user input before sending
- Implement certificate pinning for production

### 5. QR Code Handling

- Store QR token securely for offline access
- Display QR code in high contrast for easy scanning
- Provide fallback with manual token entry
- Cache QR code image locally

---

## Sample Integration Flow

### User Registration Flow

1. User enters email, username, password
2. App calls `POST /auth/register/start`
3. User receives OTP via email
4. User enters OTP in app
5. App calls `POST /auth/register/verify`
6. Account created successfully

### Event Registration Flow

1. User browses events via `GET /events`
2. User selects event and views details via `GET /events/{slug}`
3. User registers via `POST /events/{slug}/register` (public) or `POST /registrations` (authenticated)
4. App receives QR code and calendar links
5. App stores QR token for check-in
6. User receives confirmation email with QR code and ICS file

### Check-in Flow (Admin)

1. Admin logs in via `POST /auth/login`
2. Admin scans attendee's QR code
3. App extracts QR token from code
4. App calls `POST /registrations/checkin` with token
5. Success message displayed
6. Check-in recorded with timestamp

---

## Support

For API issues or questions:

- Email: api-support@your-domain.com
- Documentation: https://your-domain.com/docs
- Status Page: https://status.your-domain.com

---

**Last Updated:** 2024-06-01
**API Version:** 1.0
