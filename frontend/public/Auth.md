# Agent Authentication

To interact with the NeuroMeet API securely, AI agents must complete an OAuth2 authorization flow. 

## Endpoints
- **Authorization URL:** `https://neuromeet.anasdev.shop/api/auth/authorize`
- **Token URL:** `https://neuromeet.anasdev.shop/api/auth/token`
- **Register URI:** `https://neuromeet.anasdev.shop/api/auth/register`

## Authentication Flow
1. Redirect the user to the Authorization URL to obtain an authorization grant.
2. Exchange the authorization grant for an access token at the Token URL.
3. Authenticate all subsequent API requests by including the access token in the HTTP `Authorization` header:
   `Authorization: Bearer <your_access_token>`

## Scopes
- `read:meetings` - View active and past meetings.
- `write:meetings` - Create and manage meeting lifecycle.
- `read:engagement` - Access AI-processed ADHD engagement metrics.
