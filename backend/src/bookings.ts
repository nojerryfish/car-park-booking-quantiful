import type { DB } from "./db.js"

export type Booking = {
  id: number
  date: string // YYYY-MM-DD
  name: string | null
  created_at: string // ISO
}

export function createBookingsDao(db: DB) {
  const insert = db.prepare(
    `INSERT INTO bookings (date, name, created_at) VALUES (@date, @name, @created_at)`
  )
  const selectRange = db.prepare<{
    from: string
    to: string
  }>(
    `SELECT id, date, name, created_at FROM bookings WHERE date >= @from AND date <= @to ORDER BY date ASC`
  )

  const getByDate = db.prepare<{ date: string }>(
    `SELECT id, date, name, created_at FROM bookings WHERE date = @date`
  )

  return {
    create(date: string, name: string | null): Booking {
      const created_at = new Date().toISOString()
      const result = insert.run({ date, name, created_at })
      const id = Number(result.lastInsertRowid)
      return { id, date, name, created_at }
    },
    list(from: string, to: string): Booking[] {
      return selectRange.all({ from, to }) as Booking[]
    },
    getByDate(date: string): Booking | undefined {
      return getByDate.get({ date }) as Booking | undefined
    },
  }
}
