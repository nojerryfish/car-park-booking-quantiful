export type Booking = {
  id: number;
  date: string;
  name: string | null;
  created_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function listBookings(from: string, to: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/api/bookings?from=${from}&to=${to}`);
  if (!res.ok) throw new Error(`Failed to list bookings: ${res.status}`);
  return res.json();
}

export async function createBooking(date: string, name?: string): Promise<Booking> {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, name })
  });
  if (res.status === 409) {
    const body = await res.json();
    const message = body?.message || 'Date already booked';
    throw new Error(message);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.message || 'Failed to create booking';
    throw new Error(message);
  }
  return res.json();
}
