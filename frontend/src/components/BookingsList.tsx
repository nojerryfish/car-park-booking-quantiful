import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteBooking, listBookings, type Booking } from "../api"

type Props = {
  from: string
  to: string
}

export function BookingsList({ from, to }: Props) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bookings", from, to],
    queryFn: () => listBookings(from, to),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })

  if (isLoading) return <div>Loading…</div>
  if (isError) return <div style={{ color: "crimson" }}>{error?.message || "Failed to load"}</div>

  if (!data || data.length === 0) return <div>No bookings in range.</div>

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {data.map((b: Booking) => (
        <li
          key={b.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
            padding: 8,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        >
          <div style={{ flex: 1 }}>
            <strong>{b.date}</strong>
            {b.name ? ` – ${b.name}` : null}
          </div>
          <button
            onClick={() => deleteMutation.mutate(b.id)}
            disabled={deleteMutation.isPending}
            style={{
              padding: "4px 8px",
              fontSize: "0.8rem",
              color: "crimson",
              border: "1px solid crimson",
              backgroundColor: "white",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {deleteMutation.isPending ? "Deleting…" : "Cancel"}
          </button>
        </li>
      ))}
    </ul>
  )
}
