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

/** Current instant as a UTC ISO 8601 string, for createdAt/modifiedAt. */
export function nowIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}Z`;
}
