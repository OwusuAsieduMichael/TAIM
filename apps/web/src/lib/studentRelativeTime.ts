/** Human-readable age for "last updated" labels (no extra deps). */
export function formatDataAge(updatedAtMs: number, nowMs = Date.now()): string {
  if (!updatedAtMs) return 'Not loaded yet';
  const sec = Math.max(0, Math.floor((nowMs - updatedAtMs) / 1000));
  if (sec < 10) return 'Just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
