# API Gateway (ms-gateway)

This is the main entry point for the Kanux Backend microservices. It acts as a central proxy that forwards requests to the appropriate microservice based on the URL path.

## Overview

- **Tech Stack**: Node.js, Express, http-proxy-middleware.
- **Port**: 3000 (Default).
- **Architecture**: Modular Dynamic Proxy.

## Project Structure

Here is a brief explanation of the key files:

- **`src/server.ts`**: The entry point. Starts the Express server and logs the active proxies.
- **`src/app.ts`**: The main application logic. Sets up security middleware (Helmet, CORS) and dynamically loads the proxy routes.
- **`src/config/env.ts`**: Centralized configuration. Loads environment variables (like ports and URLs) for all microservices.
- **`src/proxies/index.ts`**: Defines the routing rules. If you need to add a new microservice, you simply add it to the list in this file.

## How to Run

### Run Gateway Only
To start only the gateway:
```bash
npm run dev:gateway
```
*Runs on http://localhost:3010*

### Run All Microservices
To start the gateway and all connected services:
```bash
npm run dev:all
```
*(This command is run from the root `kanux-backend` folder)*

## How to Test

You can test connections to the microservices using `curl` or Postman. All requests should be sent to the **Gateway Port (3010)**.

### Health Checks

| Microservice | URL (Gateway) | Target (Internal) |
| :--- | :--- | :--- |
| **Auth** | `GET http://localhost:3010/auth/health` | `http://localhost:3001` |
| **Profiles** | `GET http://localhost:3010/profiles/health` | `http://localhost:3002` |
| **Challenges** | `GET http://localhost:3010/challenges/health` | `http://localhost:3003` |
| **Companies** | `GET http://localhost:3010/companies/health` | `http://localhost:3004` |
| **Subscriptions** | `GET http://localhost:3010/subscriptions/health` | `http://localhost:3005` |
| **Messages** | `GET http://localhost:3010/messages/health` | `http://localhost:3006` |
| **Feed** | `GET http://localhost:3010/feed/health` | `http://localhost:3007` |

### Example Request (Auth)

To test the login route via the gateway:

```bash
curl -X POST http://localhost:3010/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "123"}'
```
