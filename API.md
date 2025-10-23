# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: 201 Created
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "is_premium": false
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "is_premium": false
  }
}
```

### Songs

#### Get All Songs
```http
GET /songs?search=love&page=1&limit=20

Response: 200 OK
{
  "songs": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "artist_id": 1,
      "album": "Album Name",
      "genre": "Pop",
      "duration": 240,
      "file_url": "https://example.com/song.mp3",
      "cover_url": "https://example.com/cover.jpg",
      "plays": 1000,
      "downloads": 500,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20
}
```

#### Get Song by ID
```http
GET /songs/:id

Response: 200 OK
{
  "id": 1,
  "title": "Song Title",
  "artist": "Artist Name",
  ...
}
```

#### Record Song Play
```http
POST /songs/:id/play

Response: 200 OK
{
  "message": "Play recorded",
  "songId": 1
}
```

#### Download Song
```http
POST /songs/:id/download
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Download recorded",
  "songId": 1
}
```

### Playlists

#### Get User Playlists
```http
GET /playlists
Authorization: Bearer <token>

Response: 200 OK
{
  "playlists": [
    {
      "id": 1,
      "user_id": 1,
      "name": "My Playlist",
      "description": "My favorite songs",
      "is_public": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Playlist
```http
POST /playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Playlist",
  "description": "My favorite songs",
  "isPublic": false
}

Response: 201 Created
{
  "id": 1,
  "user_id": 1,
  "name": "My Playlist",
  "description": "My favorite songs",
  "is_public": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Playlist by ID
```http
GET /playlists/:id

Response: 200 OK
{
  "id": 1,
  "user_id": 1,
  "name": "My Playlist",
  "description": "My favorite songs",
  "is_public": false,
  "songs": [
    {
      "id": 1,
      "title": "Song Title",
      ...
    }
  ]
}
```

#### Add Song to Playlist
```http
POST /playlists/:id/songs
Authorization: Bearer <token>
Content-Type: application/json

{
  "songId": 1
}

Response: 200 OK
{
  "message": "Song added to playlist"
}
```

#### Remove Song from Playlist
```http
DELETE /playlists/:id/songs/:songId
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Song removed from playlist"
}
```

#### Delete Playlist
```http
DELETE /playlists/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Playlist deleted"
}
```

### Artists

#### Get All Artists
```http
GET /artists?search=taylor&page=1&limit=20

Response: 200 OK
{
  "artists": [
    {
      "id": 1,
      "name": "Artist Name",
      "bio": "Artist biography",
      "genre": "Pop",
      "image_url": "https://example.com/artist.jpg",
      "followers": 10000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20
}
```

#### Get Artist by ID
```http
GET /artists/:id

Response: 200 OK
{
  "id": 1,
  "name": "Artist Name",
  "bio": "Artist biography",
  "genre": "Pop",
  "image_url": "https://example.com/artist.jpg",
  "followers": 10000,
  "songs": [
    {
      "id": 1,
      "title": "Song Title",
      ...
    }
  ]
}
```

#### Follow Artist
```http
POST /artists/:id/follow
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Artist followed successfully"
}
```

#### Unfollow Artist
```http
DELETE /artists/:id/follow
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Artist unfollowed successfully"
}
```

#### Get Followed Artists
```http
GET /artists/me/following
Authorization: Bearer <token>

Response: 200 OK
{
  "artists": [
    {
      "id": 1,
      "name": "Artist Name",
      ...
    }
  ]
}
```

### Recommendations

#### Get Personalized Recommendations
```http
GET /recommendations
Authorization: Bearer <token>

Response: 200 OK
{
  "songs": [
    {
      "id": 1,
      "title": "Song Title",
      ...
    }
  ],
  "cached": false
}
```

#### Get Trending Songs
```http
GET /recommendations/trending

Response: 200 OK
{
  "songs": [
    {
      "id": 1,
      "title": "Song Title",
      ...
    }
  ],
  "cached": false
}
```

### Payments

#### Create Payment Intent
```http
POST /payments/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "monthly"  // or "yearly"
}

Response: 200 OK
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

#### Get Subscription Status
```http
GET /payments/subscription
Authorization: Bearer <token>

Response: 200 OK
{
  "isPremium": true,
  "expiresAt": "2025-01-01T00:00:00Z"
}
```

#### Stripe Webhook (Internal Use)
```http
POST /payments/webhook
Content-Type: application/json
Stripe-Signature: <stripe-signature>

{
  // Stripe event payload
}

Response: 200 OK
{
  "received": true
}
```

### Users

#### Get User Profile
```http
GET /users/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "is_premium": false,
  "premium_expires_at": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update User Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe"
}

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "name": "Jane Doe",
  "is_premium": false
}
```

#### Get Listening History
```http
GET /users/me/history
Authorization: Bearer <token>

Response: 200 OK
{
  "history": [
    {
      "id": 1,
      "title": "Song Title",
      "artist": "Artist Name",
      "downloaded_at": "2024-01-01T00:00:00Z",
      ...
    }
  ]
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions (e.g., premium feature for free users)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider adding rate limiting to prevent abuse.

## Caching

The following endpoints use Redis caching:
- `GET /songs/:id` - Cached for 1 hour
- `GET /recommendations` - Cached for 1 hour per user
- `GET /recommendations/trending` - Cached for 30 minutes

## Pagination

Endpoints that support pagination accept these query parameters:
- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Results per page

## Search

Endpoints that support search accept a `search` query parameter for full-text search across relevant fields.

## WebSockets

WebSockets are not currently implemented but could be added for:
- Real-time notifications
- Live listening sessions
- Chat functionality

## Versioning

The API is currently unversioned. When adding breaking changes, consider versioning:
- URL versioning: `/api/v1/songs`
- Header versioning: `Accept: application/vnd.api+json; version=1`
