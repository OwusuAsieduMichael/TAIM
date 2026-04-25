/** Calendar date `YYYY-MM-DD` in the given IANA `timeZone` for instant `d`. */
export function calendarDateInTimeZone(d: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60 * 1000);
}

export function punctualityDeadline(issuedAt: Date, minutes: number): Date {
  return addMinutes(issuedAt, minutes);
}
