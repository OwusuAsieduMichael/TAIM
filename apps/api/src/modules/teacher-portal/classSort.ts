/** Canonical sort: KG1, KG2, primary P1–P6 (if present), JHS1–JHS3, then others by name. */
const LEVEL_RANK: Record<string, number> = {
  KG1: 1,
  KG2: 2,
  P1: 11,
  P2: 12,
  P3: 13,
  P4: 14,
  P5: 15,
  P6: 16,
  JHS1: 21,
  JHS2: 22,
  JHS3: 23,
};

export function rankClassLevel(level: string | null, className: string): number {
  const lv = (level ?? '').trim().toUpperCase();
  if (lv && LEVEL_RANK[lv] !== undefined) return LEVEL_RANK[lv];
  const blob = `${className} ${lv}`;
  const m = /\b(KG[12]|P[1-6]|JHS[123])\b/i.exec(blob);
  if (m) {
    const key = m[1].toUpperCase();
    if (LEVEL_RANK[key] !== undefined) return LEVEL_RANK[key];
  }
  return 500;
}

export function compareSchoolClasses(
  a: { level: string | null; name: string },
  b: { level: string | null; name: string },
): number {
  const ra = rankClassLevel(a.level, a.name);
  const rb = rankClassLevel(b.level, b.name);
  if (ra !== rb) return ra - rb;
  return a.name.localeCompare(b.name);
}
