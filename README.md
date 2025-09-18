# Car Park Booking

A simple full-stack app where employees can see and book a single car park slot. Built with React + Vite (TypeScript) and Node.js + Express + SQLite.

## Technical Decisions

### Frontend

The frontend uses React with Vite for fast development and TypeScript for type safety. React Query manages server state and data fetching.

Although I have been working with React for a long time, I haven't used Next.js extensively in projects. Using Vite + React provides a simple and clear setup without the additional complexity of a full framework.

### Backend

The backend is built with Node.js and Express for a lightweight REST API.

SQLite (with better-sqlite3) is used for simplicity and ease of setup, as it requires no separate server. It's also perfect for handling race conditions using a UNIQUE constraint on the `date` column to prevent double bookings.

Using Vitest for testing creates a more cohesive development experience across the full stack since the frontend uses Vite.

### AI Coverage

I used GitHub Copilot to build most of the app. You can find the Copilot instructions in `.github/copilot-instructions.md`.

Within the framework that AI provided, I modified or added some features and functionality, including:

- The logic to show or hide messages for booking status in `BookingForm.tsx`
- The test for invalid date range in `bookings.spec.ts`
- Throwing unexpected errors to the global error handler in `app.ts`

## Prerequisites

- Node.js 20.x (recommended). On Windows with NVM:
  - `nvm list` then `nvm use 20`

## Install

```powershell
# From repo root
npm install
```

## Run (dev)

```powershell
# Option A: run both (frontend + backend)
npm run dev

# Option B: run separately
npm --prefix backend run dev
npm --prefix frontend run dev
```

- Backend: <http://localhost:3001>
- Frontend: <http://localhost:5173> (Vite may pick 5174+ if 5173 in use)

## Build (prod)

```powershell
# Build both
npm run build

# Start backend (serves API only)
npm start
```

## API

- GET `/api/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD` - List bookings in date range
- POST `/api/bookings` JSON `{ "date": "YYYY-MM-DD", "name"?: string }` - Create booking
  - 201 Created → booking object
  - 409 Conflict → `{ "message": "Date already booked" }`
  - 400 Bad Request on invalid payload
- DELETE `/api/bookings/:id` - Cancel booking by ID (idempotent)
  - If the resource exists → delete it → 204 No Content
  - If the resource does not exist (already deleted or never existed) → still 204 No Content

Dates are treated as strings `YYYY-MM-DD`. DB enforces `UNIQUE(date)` to prevent double bookings.

## Tests (Backend)

```powershell
npm --prefix backend run test
```

Note: Make sure your Node version in CLI is 20.x to match the test environment.
