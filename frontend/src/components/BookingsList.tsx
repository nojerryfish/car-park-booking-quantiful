import { useQuery } from '@tanstack/react-query';
import { listBookings, type Booking } from '../api';

type Props = {
  from: string;
  to: string;
};

export function BookingsList({ from, to }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', from, to],
    queryFn: () => listBookings(from, to)
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div style={{ color: 'crimson' }}>{(error as any)?.message || 'Failed to load'}</div>;

  if (!data || data.length === 0) return <div>No bookings in range.</div>;

  return (
    <ul>
      {data.map((b: Booking) => (
        <li key={b.id}>
          <strong>{b.date}</strong>
          {b.name ? ` – ${b.name}` : null}
        </li>
      ))}
    </ul>
  );
}
