# KANUX Backend – Microservices Architecture

This repository contains the backend architecture for **KANUX**, built using a **microservices-based approach** with a shared database and independent services.

The goal of this setup is to provide a **clear, scalable, and maintainable backend structure**, where each microservice can be developed and run independently while sharing common infrastructure.

---

## Architecture Overview

- **Architecture style:** Microservices
- **Language:** TypeScript
- **Runtime:** Node.js
- **Shared database:** Single database instance (not implemented yet will be added in a future user story))
- **API Gateway:** Not implemented yet (will be added in a future user story)
- **Communication:** Direct HTTP (for now)

---

## Project Structure

```
KANUX-BACKEND/
│
├── microservices/
│   ├── ms-auth/
│   ├── ms-profiles/
│   ├── ms-challenges/
│   ├── ms-companies/
│   ├── ms-subscriptions/
│   └── ms-chat/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.base.json
└── README.md
```

## Microservice Structure

Each microservice follows the same internal structure:

```
ms-<service-name>/
│
├── src/
│   ├── app.ts        # Express app configuration
│   └── server.ts     # Server bootstrap
│
├── nodemon.json
├── package.json
├── tsconfig.json
└── package-lock.json
```

Each microservice:

- Runs independently
- Has its own `package.json`
- Uses a shared TypeScript base configuration
- Reads environment variables from the root `.env`

---

## Prerequisites

- Node.js >= 18
- npm >= 9

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/gonzalodr/kanux-backend.git
cd KANUX-BACKEND
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install dependencies for each microservice

Run the following command inside each microservice folder:

```bash
cd microservices/ms-auth
npm install
```

#### Repeat for:

> ms-profiles \
> ms-challenges \
> ms-companies \
> ms-subscriptions \
> ms-chat

**node_modules are not committed and must be installed locally.**

### 4. Running the Backend

#### 4.1 Run all microservices at once

From the root folder:

```bash
npm run dev:core
```

> This command starts all backend microservices concurrently.

#### 4.2 Run a single microservice

Example:

```bash
npm run dev:auth
```

Available commands:

```bash
npm run dev:auth
npm run dev:profiles
npm run dev:challenges
npm run dev:companies
npm run dev:subscriptions
npm run dev:chat
```

### 5. Development Mode

nodemon is configured per microservice

Each service restarts automatically on file changes

TypeScript is compiled using ts-node
