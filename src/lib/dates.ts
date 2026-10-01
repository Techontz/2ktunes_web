/**
 * Date display helpers. The API sends ISO-8601 timestamps and `YYYY-MM-DD`
 * dates; a bare date must not be shifted by the viewer's timezone, so it is
 * parsed as a local calendar date.
 */

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const bare = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = bare ? new Date(Number(bare[1]), Number(bare[2]) - 1, Number(bare[3])) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | null | undefined, locale = "en-TZ"): string {
  const d = parse(value);
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(d);
  } catch {
    return d.toDateString();
  }
}

export function formatDateTime(value: string | null | undefined, locale = "en-TZ"): string {
  const d = parse(value);
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

/** "2026-03" → "Mar 2026". */
export function formatMonth(value: string | null | undefined, locale = "en-TZ"): string {
  const m = /^(\d{4})-(\d{2})/.exec(value ?? "");
  if (!m) return value ?? "—";
  try {
    return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
      new Date(Number(m[1]), Number(m[2]) - 1, 1),
    );
  } catch {
    return `${m[1]}-${m[2]}`;
  }
}

/** "3 hours ago" / "saa 3 zilizopita", via Intl.RelativeTimeFormat. */
export function relativeTime(value: string | null | undefined, locale = "en-TZ", now = Date.now()): string {
  const d = parse(value);
  if (!d) return "—";
  const diff = (d.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const [n, unit]: [number, Intl.RelativeTimeFormatUnit] =
    abs < 60
      ? [diff, "second"]
      : abs < 3600
        ? [diff / 60, "minute"]
        : abs < 86400
          ? [diff / 3600, "hour"]
          : abs < 86400 * 30
            ? [diff / 86400, "day"]
            : abs < 86400 * 365
              ? [diff / (86400 * 30), "month"]
              : [diff / (86400 * 365), "year"];
  try {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(Math.round(n), unit);
  } catch {
    return formatDate(value, locale);
  }
}

/** Today as YYYY-MM-DD in the viewer's calendar. */
export function todayIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
