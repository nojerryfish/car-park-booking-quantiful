# copilot-instructions.md

## Project Overview

- **Goal:** A simple full-stack app where employees can see and book a single car park slot, with persistence and no double bookings.
- **Core features:**
  - List booked dates
  - Book an available date (with optional name)
  - Prevent double bookings via database constraint
  - Minimal UI, prioritize clarity over styling
- **Stretch goals (optional):** Cancel booking, calendar view, basic auth `

### Tech stack

- **Frontend:** React + Vite, React Query, TypeScript, date-fns (for date utilities)
- **Backend:** Node.js (Express), SQLite (better-sqlite3), Zod (for validation)
- **Dev tooling:** Concurrently (to run both frontend & backend), Nodemon (backend hot reload), Vitest + Supertest (backend smoke tests)

---

## Project Structure

Organize as a monorepo with separate `frontend/` and `backend/` folders, plus a root `package.json` for convenience scripts.

- **Root**

  - Holds a `package.json` with scripts to run both frontend and backend together (`concurrently`).
  - README.md with instructions, API docs, and technical decisions.

- **Backend**

  - `src/`
    - `app.ts` – Express app, exported for tests
    - `index.ts` – entrypoint, starts server
    - `db.ts` – SQLite connection & schema init
    - `schema.sql` – schema file for `bookings` table + unique index
    - `bookings.ts` – DAO helpers
  - `test/`
    - `bookings.spec.ts` – Vitest + Supertest smoke tests
  - `package.json`, `tsconfig.json`

- **Frontend**
  - `src/`
    - `main.tsx` – React entry
    - `App.tsx` – root component, holds state for range & layout
    - `api.ts` – fetch helpers (GET/POST bookings)
    - `date.ts` – date utils (todayISO, plusDays, etc.)
    - `components/`
      - `BookingsList.tsx` – shows booked dates, cancel if enabled
      - `BookingForm.tsx` – form with `<input type="date">` + optional name
  - `index.html`, `package.json`, `tsconfig.json`

---

## Backend Design

### Goals

- Provide a minimal REST API for a **single shared car-park slot**.
- Persist bookings in SQLite and **prevent double booking** at the database level.
- Keep the surface small and predictable; return clear HTTP status codes.

### Data Model

- Table: `bookings`
  - `id` (INTEGER PK, autoincrement)
  - `date` (TEXT, `YYYY-MM-DD`, **UNIQUE**)
  - `name` (TEXT, nullable)
  - `created_at` (TEXT ISO timestamp, not null)
- Index: `UNIQUE(date)` — authoritative guard against collisions.

### API Surface

- `GET /api/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `POST /api/bookings`
- `DELETE /api/bookings/:id`

### Deletion Semantics

- All DELETE endpoints are idempotent.

  - If the resource exists → delete it → 204 No Content.

  - If the resource does not exist (already deleted or never existed) → still 204 No Content.

- Rationale: idempotency makes concurrent deletes and client retries safe. Two users deleting the same booking (or a client retry after a timeout) won’t produce a misleading error; the end state (“not present”) is the same.

- Request validation: return 400 only for invalid identifiers (e.g., non-numeric :id when an integer is required). Do not return 404 for missing rows on delete.

### Validation & Semantics

- Dates must match `/^\d{4}-\d{2}-\d{2}$/`.
- `name` optional, trimmed, max ~120 chars.
- Backend accepts any valid date; frontend restricts to today → +60 days.

### Concurrency & Consistency

- Use DB-level `UNIQUE(date)` for atomicity.
- Return `409 { "message": "Date already booked" }` on conflict.

### Errors & Responses

- JSON for all responses; errors shaped as `{ "message": string }`.
- `400` for invalid input, `409` for conflicts, `500` for unexpected errors.

### Configuration

- `PORT` (default 3001)
- `DB_FILE` (default `data.sqlite`, can be `:memory:` for tests)
- Enable CORS for dev frontend

---

## Frontend Design

### Goals

- Provide a minimal but functional UI for booking and viewing dates.
- Keep the experience simple: native date picker, inline feedback, no heavy styling.

### Screens & Components

- **App.tsx**: holds range state, composes form + list
- **BookingForm.tsx**: date input, name input, Book button, inline messages
- **BookingsList.tsx**: fetch & render bookings, optional cancel button

### Data Flow

- `api.ts`: `listBookings`, `createBooking`, `deleteBooking` _(stretch)_
- React Query for caching/invalidation
- `date.ts` for utilities

### Error Handling & UX

- Show loading state in list
- Inline errors for conflict/network fail
- Minimal styling; prioritize accessibility

---

## Coding Conventions

### General

- TypeScript everywhere; strict mode enabled
- **Code style**: Use Prettier defaults with these overrides:
  - **Double quotes** for strings (`"hello"` not `'hello'`)
  - **No semicolons** (rely on ASI - Automatic Semicolon Insertion)
  - 2-space indentation, 100-char line width
- Short, rationale-focused comments

### Naming & Files

- Components: `PascalCase`
- Vars/functions: `camelCase`
- Files: match component or utility name
- Folders: keep shallow

### Exports/Imports

- **No default exports** — use named exports only
- Import components and utilities with explicit names: `import { App } from "./App"`
- Avoids TypeScript module resolution issues and improves IDE support

### React

- Functional components only
- Local state for forms, React Query for server state
- Explicit prop names

### Styling

- Inline styles or minimal CSS
- Keep consistent spacing

### API/Backend

- Thin routes, DB logic in DAO
- Validate with Zod
- Conflict → `409`
- Log unexpected errors, don’t leak stack

### Dates

- Always `YYYY-MM-DD`
- Inclusive range semantics

### Testing

- Vitest + Supertest
- Smoke tests only
- Use `:memory:` SQLite in tests

### Git

- Small commits, clear messages
- Linear history fine for challenge

---

## Testing & QA

### Automated Tests (Backend)

- Vitest + Supertest
- Use `:memory:` SQLite
- Smoke tests: create → duplicate conflict → list → idempotent delete
- Negative tests: invalid payload, invalid range, Invalid :id format on delete

### Optional Tests

- DELETE is idempotent
- Name trimming

### Manual QA

- Happy path: create & list booking
- Conflict path: same date → error
- Range view: filter correctly
- Edge cases: past dates, empty name
- Accessibility: labels, keyboard nav

### Non-Functional

- Startup logs clean
- JSON error responses
- CORS works
- Fast local performance

### Commands

- Tests: `npm --prefix backend run test`
- Backend: `npm --prefix backend run dev`
- Frontend: `npm --prefix frontend run dev`

---

## Dev Scripts & Runbook

### Root

- `postinstall`: install deps in both frontend & backend
- `dev`: run backend + frontend together

### Backend

- `dev`: nodemon server at `http://localhost:3001`
- `build`: tsc compile
- `start`: run compiled server
- `test`: Vitest
- Env: `PORT`, `DB_FILE`

### Frontend

- `dev`: Vite dev server at `http://localhost:5173`
- `build`: prod build
- `preview`: serve prod build
- Env: `VITE_API_BASE=http://localhost:3001`

### Workflow

1. `npm run postinstall`
2. Start backend (`npm --prefix backend run dev`)
3. Start frontend (`npm --prefix frontend run dev`)
4. Visit app (`http://localhost:5173`)
5. Run tests (`npm --prefix backend run test`)
6. Build backend + frontend for prod

---

✅ End of file.
