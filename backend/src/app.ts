import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import morgan from "morgan"
import { z } from "zod"
import { createBookingsDao } from "./bookings.js"
import { getDb } from "./db.js"

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Init DAO
const db = getDb()
const bookings = createBookingsDao(db)

// Validation schemas
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const listQuerySchema = z.object({
  from: z.string().regex(DATE_RE, "from must be YYYY-MM-DD"),
  to: z.string().regex(DATE_RE, "to must be YYYY-MM-DD"),
})

const createBodySchema = z.object({
  date: z.string().regex(DATE_RE, "date must be YYYY-MM-DD"),
  name: z
    .string()
    .trim()
    .max(120, "name too long")
    .optional()
    .transform((s: string | undefined) => (s && s.length > 0 ? s : undefined)),
})

// Routes
app.get("/api/bookings", (req: Request, res: Response, next: NextFunction) => {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid query" })
  }
  const { from, to } = parsed.data

  try {
    const rows = bookings.list(from, to)
    res.json(rows)
  } catch (err: any) {
    console.error("Unexpected error listing bookings", err)
    next(err)
  }
})

app.post("/api/bookings", (req: Request, res: Response, next: NextFunction) => {
  const parsed = createBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid body" })
  }
  const { date, name } = parsed.data
  try {
    const created = bookings.create(date, name ?? null)
    res.status(201).json(created)
  } catch (err: any) {
    // better-sqlite3 throws on UNIQUE constraint violation
    const code = (err as any)?.code as string | undefined
    const message = (err as any)?.message as string | undefined
    if (
      code === "SQLITE_CONSTRAINT_UNIQUE" ||
      code === "SQLITE_CONSTRAINT" ||
      message?.includes("UNIQUE")
    ) {
      return res.status(409).json({ message: "Date already booked" })
    }
    console.error("Unexpected error creating booking", err)
    next(err)
  }
})

app.delete("/api/bookings/:id", (req: Request, res: Response, next: NextFunction) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid booking ID" })
  }

  try {
    // Idempotent delete: always return 204 regardless of whether the booking existed
    bookings.delete(id)
    res.status(204).send() // No Content
  } catch (err) {
    console.error("Unexpected error deleting booking", err)
    next(err)
  }
})

// Global error fallback (shouldn't often hit due to safeParse and try/catch)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((_err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ message: "Internal server error" })
})

export default app
