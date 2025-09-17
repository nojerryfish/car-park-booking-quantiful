import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { createBooking, listBookings } from "../api"
import { plusDays, todayISO } from "../date"
import "./BookingForm.css"

type Props = { onBooked?: () => void }

export function BookingForm({ onBooked }: Props) {
  const [date, setDate] = useState(todayISO())
  const [name, setName] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ref = useRef<string | null>(null)

  const min = todayISO()
  const max = plusDays(min, 60)

  // Fetch booked dates to show visual indicators
  const { data: bookedDates = [] } = useQuery({
    queryKey: ["bookings", min, max],
    queryFn: () => listBookings(min, max),
  })

  const bookedDateStrings = new Set(bookedDates.map((booking) => booking.date))
  const isDateBooked = bookedDateStrings.has(date)

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => createBooking(date, name.trim() || undefined),
    onSuccess: () => {
      setMessage("Booked!")
      setError(null)
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      onBooked?.()
      ref.current = date
    },
    onError: (err) => {
      setError(err?.message || "Failed to book")
      setMessage(null)
    },
  })

  useEffect(() => {
    if (ref.current !== date) {
      ref.current = null
      setMessage(null)
      setError(null)
    }
  }, [date])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={min}
            max={max}
            className={`date-input ${isDateBooked && ref.current !== date ? "date-booked" : ""}`}
            required
          />
        </label>
        <label>
          Name (optional):
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ marginLeft: 8 }}
            maxLength={120}
          />
        </label>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Booking…" : "Book"}
        </button>
      </div>
      {isDateBooked && ref.current !== date && (
        <span style={{ color: "orange", fontSize: "0.8rem", marginLeft: 4 }}>Already booked</span>
      )}
      {message && <div style={{ color: "green" }}>{message}</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
    </form>
  )
}
