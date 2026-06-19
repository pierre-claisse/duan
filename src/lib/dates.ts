import { TZ } from "../config";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Today's date as "YYYY-MM-DD" in `timeZone` (default: the professor's TZ). */
export function todayInZone(timeZone: string = TZ): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
}

/** Current year/month (1-based) in `timeZone`. */
export function currentYearMonth(timeZone: string = TZ): { year: number; month: number } {
  const [y, m] = todayInZone(timeZone).split("-").map(Number);
  return { year: y, month: m };
}

/** Current instant as a UTC ISO 8601 string, for createdAt/modifiedAt. */
export function nowIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}Z`;
}

// ── Locale-aware display formatting (idiomatic per language via Intl) ────────

/** e.g. "2026年6月" (zh-Hant) / "June 2026" (en). `bcp47` is a full tag. */
export function formatMonthYear(year: number, month: number, bcp47: string): string {
  return new Intl.DateTimeFormat(bcp47, {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/** e.g. "2026年6月19日 星期五" (zh-Hant) / "Friday, June 19, 2026" (en). */
export function formatLongDate(isoDate: string, bcp47: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(bcp47, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

/** Seven Monday-first weekday column labels, e.g. ["一",…,"日"] / ["Mon",…,"Sun"]. */
export function weekdayHeaders(bcp47: string): string[] {
  const fmt = new Intl.DateTimeFormat(bcp47, {
    weekday: bcp47.startsWith("zh") ? "narrow" : "short",
    timeZone: "UTC",
  });
  const out: string[] = [];
  // 2024-01-01 is a Monday.
  for (let i = 0; i < 7; i++) out.push(fmt.format(new Date(Date.UTC(2024, 0, 1 + i))));
  return out;
}
