# Car Park Booking

A simple full‑stack app where employees can see and book a single car‑park slot. Built with React + Vite (TS) and Node.js + Express + SQLite.

## Prereqs

- Node.js 20.x (recommended). On Windows with NVM:
  - `nvm list` then `nvm use 20.19.2`

## Install

```powershell
# from repo root
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

- Backend: http://localhost:3001
- Frontend: http://localhost:5173 (Vite may pick 5174+ if 5173 in use)

## Build (prod)

```powershell
# Build both
npm run build

# Start backend (serves API only)
npm start
```

## API

- GET `/api/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD`
- POST `/api/bookings` JSON `{ "date": "YYYY-MM-DD", "name"?: string }`
  - 201 Created → booking object
  - 409 Conflict → `{ "message": "Date already booked" }`
  - 400 Bad Request on invalid payload

Dates are treated as strings `YYYY-MM-DD`. DB enforces `UNIQUE(date)` to prevent double bookings.

## Tests (backend)

```powershell
npm --prefix backend run test
```

## Notes

- SQLite file: `backend/data.sqlite` (created on first run). Tests use `:memory:`.
- CORS is enabled for local dev. Frontend uses `VITE_API_BASE` (default `http://localhost:3001`).
- Minimal UI prioritizing clarity over styling. Stretch features (cancel, calendar, auth) can be added later.

# Car Park Booking (Quantiful)

Simple full-stack app to book a single shared car-park slot. Built with React + Vite on the frontend and Node + Express + SQLite on the backend.

## Quickstart

1. Install deps for both apps
2. Run backend and frontend together
3. Open the app

### Dev

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

### Scripts

- Root
  - `npm run postinstall` – installs deps in `backend/` and `frontend/`
  - `npm run dev` – runs backend and frontend concurrently
  - `npm run build` – builds backend and frontend

### Tests

- Backend tests: `npm --prefix backend run test`

## API

- GET `/api/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD`
- POST `/api/bookings` with `{ date: YYYY-MM-DD, name?: string }`
- 409 on double booking, 400 on invalid inputs

## Config

- `PORT` (default 3001)
- `DB_FILE` (default `data.sqlite`, use `:memory:` in tests)
- Frontend: `VITE_API_BASE` (default http://localhost:3001)

## Notes

- Unique constraint on `bookings.date` prevents double bookings.
- Minimal UI; focus on clarity.
