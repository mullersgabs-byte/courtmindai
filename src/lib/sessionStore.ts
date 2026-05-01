// Lightweight client-side store for session logs (RPE, real duration, notes)
// and weekly check-ins. Persisted in localStorage so the app remembers the
// whole week and can feed insights back into plan generation.

export type SessionLog = {
  id: string;
  date: string;            // ISO timestamp
  title?: string;
  sport?: string;
  plannedMinutes?: number;
  actualMinutes: number;
  rpe: number;             // 1..10 (Rate of Perceived Exertion)
  notes?: string;
};

export type DayCheckIn = {
  date: string;            // ISO date (YYYY-MM-DD)
  energy: number;          // 0..4 (Very low → Peak)
  sleepHours?: number;
  soreness?: number;       // 0..4
  mood?: number;           // 0..4
  note?: string;
};

export type WeekCheckIns = {
  weekKey: string;         // ISO week key, e.g. "2026-W18"
  days: Record<string, DayCheckIn>; // keyed by ISO date
};

const SESSION_LOGS_KEY = "courtmind.session_logs.v1";
const CHECKINS_KEY = "courtmind.checkins.v2";

/* ------------ helpers ------------ */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function isoDate(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ISO week key like "2026-W18" — Monday starts the week. */
export function isoWeekKey(d: Date = new Date()) {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7; // 0=Mon
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Returns the Monday of the week containing `d`. */
export function weekStart(d: Date = new Date()) {
  const out = new Date(d);
  const day = (out.getDay() + 6) % 7; // 0=Mon
  out.setDate(out.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
}

/* ------------ session logs ------------ */
export function getSessionLogs(): SessionLog[] {
  if (typeof window === "undefined") return [];
  return safeParse<SessionLog[]>(localStorage.getItem(SESSION_LOGS_KEY), []);
}

export function addSessionLog(log: SessionLog) {
  if (typeof window === "undefined") return;
  const all = getSessionLogs();
  all.unshift(log);
  localStorage.setItem(SESSION_LOGS_KEY, JSON.stringify(all.slice(0, 200)));
  window.dispatchEvent(new CustomEvent("courtmind:logs-updated"));
}

export function removeSessionLog(id: string) {
  if (typeof window === "undefined") return;
  const all = getSessionLogs().filter((l) => l.id !== id);
  localStorage.setItem(SESSION_LOGS_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("courtmind:logs-updated"));
}

/* ------------ weekly check-ins ------------ */
export function getWeekCheckIns(d: Date = new Date()): WeekCheckIns {
  if (typeof window === "undefined") return { weekKey: isoWeekKey(d), days: {} };
  const all = safeParse<Record<string, WeekCheckIns>>(
    localStorage.getItem(CHECKINS_KEY),
    {},
  );
  const key = isoWeekKey(d);
  return all[key] ?? { weekKey: key, days: {} };
}

export function saveDailyCheckIn(entry: DayCheckIn) {
  if (typeof window === "undefined") return;
  const all = safeParse<Record<string, WeekCheckIns>>(
    localStorage.getItem(CHECKINS_KEY),
    {},
  );
  const key = isoWeekKey(new Date(entry.date));
  const week = all[key] ?? { weekKey: key, days: {} };
  week.days[entry.date] = { ...week.days[entry.date], ...entry };
  all[key] = week;
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("courtmind:checkin-updated"));
}

/** Get last N days of check-ins flattened for plan generation. */
export function getRecentCheckIns(days = 7): DayCheckIn[] {
  if (typeof window === "undefined") return [];
  const all = safeParse<Record<string, WeekCheckIns>>(
    localStorage.getItem(CHECKINS_KEY),
    {},
  );
  const out: DayCheckIn[] = [];
  Object.values(all).forEach((w) => Object.values(w.days).forEach((d) => out.push(d)));
  out.sort((a, b) => b.date.localeCompare(a.date));
  return out.slice(0, days);
}

/* ------------ last analysis (video errors) ------------ */
const LAST_ANALYSIS_KEY = "courtmind.last_analysis.v1";

export type StoredAnalysis = {
  id: string;
  date: string;
  overallScore: number;
  verdict: string;
  events: Array<{
    time_seconds: number;
    type: "good" | "warn" | "bad";
    title: string;
    detail: string;
    body_part?: string;
  }>;
};

export function saveLastAnalysis(a: StoredAnalysis) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_ANALYSIS_KEY, JSON.stringify(a));
}

export function getLastAnalysis(): StoredAnalysis | null {
  if (typeof window === "undefined") return null;
  return safeParse<StoredAnalysis | null>(
    localStorage.getItem(LAST_ANALYSIS_KEY),
    null,
  );
}