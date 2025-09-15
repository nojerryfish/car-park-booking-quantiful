import { addDays } from 'date-fns';

export function todayISO(): string {
  const now = new Date();
  return formatDate(now);
}

export function plusDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  return formatDate(addDays(d, days));
}

export function formatDate(d: Date): string {
  // Keep only the date part in local time
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
