import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { createBooking } from "../api"
import { plusDays, todayISO } from "../date"

type Props = { onBooked?: () => void }

export function BookingForm({ onBooked }: Props) {
  const [date, setDate] = useState(todayISO())
  const [name, setName] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => createBooking(date, name.trim() || undefined),
    onSuccess: () => {
      setMessage("Booked!")
      setError(null)
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      onBooked?.()
    },
    onError: (err: any) => {
      setError(err?.message || "Failed to book")
      setMessage(null)
    },
  })

  const min = todayISO()
  const max = plusDays(min, 60)

  return (
    <form
      onSubmit={e => {
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
            onChange={e => setDate(e.target.value)}
            min={min}
            max={max}
            style={{ marginLeft: 8 }}
            required
          />
        </label>
        <label>
          Name (optional):
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            style={{ marginLeft: 8 }}
            maxLength={120}
          />
        </label>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Booking…" : "Book"}
        </button>
      </div>
      {message && <div style={{ color: "green" }}>{message}</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
    </form>
  )
}
