# Access Manager

An internal access management service that allows employees to request access to applications and allows authorized approvers to approve or reject those requests.

The system also includes an AI-powered agent that can analyze access requests and provide a recommendation to assist approvers.

---

# Architecture

## High-Level Architecture
```mermaid
    flowchart TD
        Frontend[React + TypeScript Frontend]
        Backend[Express Backend]
        Auth[Authentication Module]
        Requests[Access Request Module]
        AI[AI Agent Module]
        Middleware[Authentication / Authorization Middleware]
        DB[(PostgreSQL)]
        LLM[OpenRouter / LLM]

        Frontend -->|REST API| Backend
        Backend --> Middleware
        Middleware --> Auth
        Middleware --> Requests
        Middleware --> AI
        Auth --> DB
        Requests --> DB
        AI --> DB
        AI --> LLM
        AI --> Evaluation[AI Review Evaluation]
```

## Backend Architecture

```mermaid
    flowchart TD
        Routes[Express Routes]
        Middleware[Middleware]
        Controllers[Controllers]
        Services[Services]
        Database[(PostgreSQL)]

        Routes --> Middleware
        Middleware --> Controllers
        Controllers --> Services
        Services --> Database
```

The backend follows a layered architecture.

The controllers are responsible for handling HTTP requests and responses,
while services contain the application's business logic and database
operations.

The AI functionality is separated from the normal business logic. The AI
agent is responsible for constructing prompts, communicating with the LLM,
parsing its response, and evaluating the resulting review.

---

# Key Architectural Decisions and Assumptions

## Layered Backend Architecture

The backend is divided into routes, middleware, controllers, and services.

- Routes define the available API endpoints.
- Middleware handles cross-cutting concerns such as authentication and
  authorization.
- Controllers handle HTTP-specific logic such as reading request parameters
  and sending responses.
- Services contain the application's business logic and database operations.

This separation keeps HTTP handling separate from business logic and makes
the individual components easier to test and maintain.

## AI Architecture

The AI functionality is separated from the application's core business
logic.

The AI agent:

1. Retrieves the relevant access request information.
2. Builds a structured prompt.
3. Sends the prompt to the configured LLM.
4. Parses the LLM response.
5. Validates the response.
6. Evaluates the resulting recommendation using deterministic checks.

The AI provides a recommendation to assist the approver. It does not
directly approve or reject access requests.

## AI Assumptions

The AI output is treated as an advisory recommendation rather than an
authoritative decision.

The final access decision remains the responsibility of an authorized
approver.

---

# Requirements

The backend and frontend run locally. Docker Compose is used only to run
PostgreSQL.

The following software is required:

- Node.js `20.19+` or `22.12+`
- npm
- Docker and Docker Compose

No Dockerfile is required for the backend or frontend.

---


# Running the Project

## Run PostgreSQL Using Docker

Start the PostgreSQL container:

    docker compose up -d

Verify that the container is running:

    docker compose ps

The provided Docker Compose configuration exposes PostgreSQL on port `5433`
on the host.

The database URL should therefore be:

    DATABASE_URL=postgresql://postgres:1234@localhost:5433/access_manager

---

## Install Backend Dependencies

From the project root:

    npm install

---

## Set .env

Copy the environment template without modifying the tracked example file:

    cp .env.example .env

Set `OPENROUTER_API_KEY` in `.env`. The remaining values are configured for
the PostgreSQL container above.

---

## Initialize the Database

Push the current Drizzle schema to the database:

    npm run db:push

Run the seed script:

    npm run seed

The seed script creates the initial applications and users required for
testing.

---

## Build and Run the Backend

Build the TypeScript project:

    npm run build

Then start the compiled server:

    npm start

---

# Running the Frontend

The React frontend runs separately from the Express backend. In a second
terminal:

    cd frontend
    npm install
    npm run dev

The frontend is available at `http://localhost:5173` and is preconfigured to
call the backend at `http://localhost:3000` through
`frontend/.env` (`VITE_API_URL`).

---

# API Documentation

Please note that additional examples are provided in the examples.rest file

## Base URL

    http://localhost:3000

---

# Authentication Endpoints (only important ones)

## Register

    POST /auth/register

Creates a new requester account.

Authentication: Not required.

### Request

    {
      "name": "john",
      "password": "password123"
    }

### Response

201 Created

    {
      "accessToken": "<access-token>",
      "userInfo": {
        "id": "<user-id>",
        "username": "john",
        "role": "REQUESTER"
      }
    }

---

## Login

    POST /auth/login

Authenticates an existing user.

Authentication: Not required.

### Request

    {
      "name": "john",
      "password": "password123"
    }

### Response

201 OK

    {
      "accessToken": "<access-token>",
      "userInfo": {
        "id": "<user-id>",
        "username": "john",
        "role": "REQUESTER"
      }
    }

---

# Access Request Endpoints

## Create Access Request

    POST /requests/create

Creates a new access request.

Authentication: Required.

Required role: `REQUESTER`.

### Request

    {
      "appId": "<application-id>",
      "level": "READ",
      "reason": "I need access to perform my work."
    }

### Response

201 Created

    {
    "id": "<request-id>",
    "appId": "<application-id>",
    "level": "READ",
    "reason": "hello world",
    "createdBy": "<user-id>",
    "createdAt": "<creation time>",
    "decisionBy": null,
    "decisionAt": null,
    "state": "PENDING"
    }

---

## Get Access Requests

    GET /requests

Returns access requests visible to the authenticated user.

Authentication: Required.

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `requesterId` | UUID | No | Filter by requester |
| `level` | string | No | `READ` or `WRITE` |
| `appId` | UUID | No | Filter by application |
| `state` | string | No | `PENDING`, `APPROVED`, or `REJECTED` |

Requesters can only see their own requests.

Approvers can view requests from other users.

### Example Request

    GET /requests?state=PENDING&level=WRITE
    Authorization: Bearer <access-token>

### Response

200 OK

    [
      {
        "id": "<request-id>",
        "appId": "<application-id>",
        "level": "WRITE",
        "reason": "I need access to deploy the application.",
        "state": "PENDING",
        "createdBy": "<user-id>",
        "createdByUsername": "john",
        "createdAt": "2026-08-12T15:30:00.000Z",
        "decisionBy": null,
        "decisionByUsername": null,
        "decisionAt": null
      }
    ]

---

## Decide Access Request

    PATCH /requests/:requestId

Approves or rejects a pending access request.

Authentication: Required.

Required role: `APPROVER`.

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `requestId` | UUID | ID of the request |

### Request

    {
      "state": "APPROVED"
    }

Valid states:

    APPROVED
    REJECTED

### Response

200 OK

    {
        "id": "<request-id>",
        "appId": "<application-id>",
        "level": "WRITE",
        "reason": "I need access to deploy the application.",
        "state": "APPROVED",
        "createdBy": "<user-id>",
        "createdByUsername": "john",
        "createdAt": "2026-08-12T15:30:00.000Z",
        "decisionBy": <user-id>,
        "decisionByUsername": "doe",
        "decisionAt": "2026-08-12T16:30:00.000Z"
      }

---

## Get Applications

    GET /requests/apps

Returns the applications available for access requests.

Authentication: Required.

### Response

200 OK

    [
      {
        "id": "<application-id>",
        "name": "GitHub",
        "description": "Version control"
      },
      {
        "id": "<application-id>",
        "name": "Google Drive",
        "description": "Upload files to the cloud"
      }
    ]

---

# AI Endpoints

## Review Access Request with AI

    POST /ai/requests/:requestId/review

Uses the AI agent to analyze an access request and provide a recommendation.

Authentication: Required.

### Response

200 OK

    {
      "recommendation": "APPROVE",
      "confidence": 0.87,
      "evaluation": {
            "valid": true,
            "issues": []
      },
      "reasoning": "The requested access appears consistent with the user's stated reason and the application's purpose."
    }


---
