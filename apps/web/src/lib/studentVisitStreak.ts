const KEY = 'taim-student-visit-streak';

type StreakState = { lastYmd: string; count: number };

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function prevDayYmd(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d!);
  dt.setDate(dt.getDate() - 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function read(): StreakState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as StreakState;
    if (!o?.lastYmd || typeof o.count !== 'number') return null;
    return o;
  } catch {
    return null;
  }
}

function write(s: StreakState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

/** Call once when the student shell mounts (e.g. layout). */
export function bumpVisitStreak(): StreakState {
  const today = todayYmd();
  const cur = read();
  if (!cur) {
    const next = { lastYmd: today, count: 1 };
    write(next);
    return next;
  }
  if (cur.lastYmd === today) return cur;
  if (cur.lastYmd === prevDayYmd(today)) {
    const next = { lastYmd: today, count: cur.count + 1 };
    write(next);
    return next;
  }
  const next = { lastYmd: today, count: 1 };
  write(next);
  return next;
}

export function getVisitStreak(): StreakState {
  return read() ?? { lastYmd: todayYmd(), count: 0 };
}
