import { useState } from "react"
import { BookingForm } from "./components/BookingForm"
import { BookingsList } from "./components/BookingsList"
import { plusDays, todayISO } from "./date"

export default function App() {
  const [from, setFrom] = useState(todayISO())
  const [to, setTo] = useState(plusDays(todayISO(), 60))

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>Car Park Booking</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Book a single shared car-park slot.
      </p>

      <section
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Create booking</h2>
        <BookingForm
          onBooked={() => {
            /* list will refetch via react-query invalidation in component */
          }}
        />
      </section>

      <section
        style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Booked dates</h2>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <label>
            From:
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </label>
          <label>
            To:
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </label>
        </div>
        <BookingsList from={from} to={to} />
      </section>
    </div>
  )
}
