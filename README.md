# Access Manager

An internal access management service that allows employees to request access to applications and allows authorized approvers to approve or reject those requests.

The system also includes an AI-powered agent that can analyze access requests and provide a recommendation to assist approvers.

---

## Features

- User registration and login
- JWT-based authentication
- Refresh-token based sessions
- Role-based authorization
- Requester and approver roles
- Application access requests
- Access levels (`READ` / `WRITE`)
- Request filtering
- Request approval/rejection
- Request audit information
- Structured server-side logging
- AI-assisted access request reviews
- AI response validation and evaluation
- PostgreSQL database
- Dockerized PostgreSQL development environment

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

Authentication and authorization are handled by middleware before protected
controller actions are executed.

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

## Authentication

The application uses JWT access tokens for authenticated API requests.

Refresh tokens are stored in the database as hashes rather than storing the
original refresh tokens.

Protected endpoints require authentication, while endpoints that modify
access requests are additionally protected using role-based authorization.

## Roles

The system supports two roles:

- `REQUESTER` — can create and view their own access requests.
- `APPROVER` — can view requests and approve or reject pending requests.

A requester cannot access another user's requests even if they attempt to
provide another user's ID as a filter.

## Database

PostgreSQL is used as the application's persistent database.

Drizzle ORM is used to define the database schema and interact with the
database.

## Docker

PostgreSQL can be run using Docker Compose so that the project does not
require a manually configured PostgreSQL installation.

The application itself can still be run directly using Node.js during
development.

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

The following software is required to run the project locally:

- Node.js
- npm

For the Docker setup:

- Docker
- Docker Compose

---

# Environment Variables

Create a `.env` file in the project root.

Example:

    DATABASE_URL=postgresql://postgres:1234@localhost:5433/access_manager

    ACCESS_TOKEN_SECRET=your-access-token-secret
    JWT_SECRET=your-jwt-secret

    ACCESS_TOKEN_LIFETIME_MINUTES=15
    REFRESH_TOKEN_LIFETIME_DAYS=7

    OPENROUTER_API_KEY=your-openrouter-api-key

Use the actual environment variable names required by the project.

Do not commit the `.env` file or real API keys to the repository.

A `.env.example` file should be provided with placeholder values.

---

# Running the Project

##  Run PostgreSQL Using Docker

Start the PostgreSQL container:

    docker compose up -d

Verify that the container is running:

    docker compose ps

The provided Docker Compose configuration exposes PostgreSQL on port `5433`
on the host.

The database URL should therefore be:

    DATABASE_URL=postgresql://postgres:1234@localhost:5433/access_manager

---

## Install Dependencies

From the project root:

    npm install

---

## Initialize the Database

Push the current Drizzle schema to the database:

    npm run db:push

Run the seed script:

    npm run seed

The seed script creates the initial applications and users required for
testing.

---

## Run the Backend in Development

    npm run dev

The backend will start on:

    http://localhost:<PORT>

Replace `<PORT>` with the port configured by the server.

---

## Build and Run the Backend

Build the TypeScript project:

    npm run build

Then start the compiled server:

    npm start

---

# Running the Frontend

The React frontend is run separately from the Express backend.

    npm run <frontend-dev-script>

The frontend communicates with the Express backend through the REST API.

Replace `<frontend-dev-script>` with the actual frontend script in
`package.json`.

---

# API Documentation

## Base URL

    http://localhost:<PORT>

---

# Authentication Endpoints

## Register

    POST /<auth-prefix>/register

Creates a new requester account.

Authentication: Not required.

### Request

    {
      "username": "john",
      "password": "password123"
    }

### Response

201 Created

    {
      "accessToken": "<access-token>",
      "refreshToken": "<refresh-token>",
      "userInfo": {
        "id": "<user-id>",
        "username": "john",
        "role": "REQUESTER"
      }
    }

### Possible Errors

409 Conflict

    {
      "message": "Username already exists"
    }

---

## Login

    POST /<auth-prefix>/login

Authenticates an existing user.

Authentication: Not required.

### Request

    {
      "username": "john",
      "password": "password123"
    }

### Response

200 OK

    {
      "accessToken": "<access-token>",
      "refreshToken": "<refresh-token>",
      "userInfo": {
        "id": "<user-id>",
        "username": "john",
        "role": "REQUESTER"
      }
    }

---

## Refresh Access Token

    POST /<auth-prefix>/refresh

Generates a new access token using a valid refresh token.

Authentication: Not required.

### Request

    {
      "refreshToken": "<refresh-token>"
    }

### Response

200 OK

    {
      "accessToken": "<new-access-token>"
    }

---

## Logout

    POST /<auth-prefix>/logout

Invalidates the current refresh token.

Authentication: Required.

### Request

    {
      "refreshToken": "<refresh-token>"
    }

### Response

    [Document actual response here]

---

## Get Current User

    GET /<auth-prefix>/me

Returns information about the currently authenticated user.

Authentication: Required.

### Response

200 OK

    {
      "id": "<user-id>",
      "username": "john",
      "role": "REQUESTER"
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

    [Document actual response here]

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

    [Document actual response here]

### Possible Errors

409 Conflict

Returned when the request does not exist or has already been decided.

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
        "description": "Version control stuff"
      },
      {
        "id": "<application-id>",
        "name": "Google Drive",
        "description": "Upload stuff to the cloud"
      }
    ]

---

# AI Endpoints

## Review Access Request with AI

    POST /<ai-prefix>/<path>

Uses the AI agent to analyze an access request and provide a recommendation.

Authentication: Required.

### Request

    {
      "requestId": "<request-id>"
    }

Replace this with the actual request format if the request ID is provided
as a path parameter instead.

### Response

200 OK

    {
      "recommendation": "APPROVE",
      "confidence": 0.87,
      "reasoning": "The requested access appears consistent with the user's stated reason and the application's purpose."
    }

Replace the response with the actual `AIReview` structure returned by the
implementation.

---

# Authentication

Protected endpoints require a valid access token.

The token should be sent using the following header:

    Authorization: Bearer <access-token>

---

# Error Handling

The API uses a centralized error handler.

Errors generally follow this format:

    {
      "message": "Description of the error"
    }

Common HTTP status codes include:

| Status | Meaning |
|---|---|
| `400` | Invalid request |
| `401` | Authentication required or invalid credentials |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Request conflicts with current state |
| `500` | Internal server error |
| `502` | External AI service failure |

---

# Logging

The backend uses structured logging for important operational events,
including authentication events, request creation, request decisions, and
errors.

Logs include structured fields such as:

- event name
- user ID
- request ID
- HTTP method
- request path
- error information

---

# AI Agent

The AI agent is implemented as a separate module from the normal access
request business logic.

The agent performs the following operations:

    Access Request
          |
          v
    Build Prompt
          |
          v
        LLM
          |
          v
    Parse Response
          |
          v
    Validate AI Review
          |
          v
    Evaluate Review
          |
          v
    AI Recommendation

The LLM is accessed through OpenRouter.

The AI response is parsed and checked before being returned to the
application.

The AI recommendation is advisory and does not replace the approver's
decision.

---

# Database

The application uses PostgreSQL with Drizzle ORM.

The main entities include:

- Users
- Applications
- Access Requests
- Refresh Tokens

Access requests contain audit information including:

- creator
- creation time
- decision maker
- decision time
- current state
- request reason

---