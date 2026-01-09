# API Gateway

## Overview

The API Gateway acts as the single entry point for all client requests.  
It receives incoming HTTP requests and forwards them to the corresponding microservice based on the route prefix.

Clients never communicate directly with microservices.  
All traffic must go through the API Gateway.

---

## Routing Strategy

Each microservice is mapped to a specific route prefix:

| Route Prefix         | Microservice     | Target URL             |
| -------------------- | ---------------- | ---------------------- |
| `/api/auth`          | ms-auth          | `MS_AUTH_URL`          |
| `/api/profiles`      | ms-profiles      | `MS_PROFILES_URL`      |
| `/api/challenges`    | ms-challenges    | `MS_CHALLENGES_URL`    |
| `/api/companies`     | ms-companies     | `MS_COMPANIES_URL`     |
| `/api/subscriptions` | ms-subscriptions | `MS_SUBSCRIPTIONS_URL` |

The API Gateway uses HTTP proxy middleware to forward requests and responses transparently.

---

## Example Request Flow

```text
Client
  |
  |  GET /api/auth/health
  |
API Gateway (localhost:3000)
  |
  |  Proxy to MS_AUTH_URL + /health
  |
ms-auth (localhost:3001)
```

## Public and Private Routes

### Current Status

At this stage of the project, **all routes exposed by the API Gateway are public**.

- No authentication middleware is implemented yet
- No JWT validation is performed at the gateway level
- No role-based access control is enforced

This is intentional and will be addressed in a future user story.

---

## Planned Security (Future Work)

In future iterations, the API Gateway will:

- Validate JWT tokens on protected routes
- Distinguish between public and private endpoints
- Restrict access based on user roles (`talent` / `company`)
- Block unauthorized requests before reaching microservices

---

## Error Handling

If a microservice is unavailable, the API Gateway:

- Detects proxy connection errors
- Returns an **HTTP 503 Service Unavailable** response
- Provides a consistent JSON error message to the client

### Example Response

```json
{
  "message": "Service unavailable"
}
```

## Running the API Gateway

```bash
npm install
npm run dev
```
