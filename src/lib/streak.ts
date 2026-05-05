export type WorkoutEntry = {
  id: string;
  date: string;
  title: string;
  sport?: string;
  durationMinutes?: number;
};

export type LastFeedback = {
  id: string;
  date: string;
  sport: string;
  exerciseName: string;
  durationSeconds: number;
  overallScore: number;
  verdict: string;
  positives: string[];
  mistakes: string[];
  improvements: string[];
  steps: string[];
};

const KEY_HIST = "courtmind.history.v1";
const KEY_FB = "courtmind.last_feedback.v1";
const KEY_GOAL = "courtmind.weekly_goal.v1";
const KEY_BADGES = "courtmind.badges.v1";

export function readHistory(): WorkoutEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_HIST) || "[]"); } catch { return []; }
}

export function readLastFeedback(): LastFeedback | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY_FB) || "null"); } catch { return null; }
}

export function getWeeklyGoal(): number {
  if (typeof window === "undefined") return 4;
  try { return Number(localStorage.getItem(KEY_GOAL) || 4); } catch { return 4; }
}
export function setWeeklyGoal(n: number) {
  try { localStorage.setItem(KEY_GOAL, String(Math.max(1, Math.min(7, n)))); } catch {}
}

export type WeekStats = {
  sessions: number;
  minutes: number;
  streak: number;
  longestStreak: number;
  goal: number;
  goalProgress: number; // 0..1
};

export function computeStats(history: WorkoutEntry[] = readHistory()): WeekStats {
  const goal = getWeeklyGoal();
  const now = Date.now();
  const weekAgo = now - 7 * 86_400_000;
  const week = history.filter((w) => +new Date(w.date) >= weekAgo);
  const minutes = week.reduce((s, w) => s + (w.durationMinutes || 0), 0);

  const days = new Set(history.map((w) => new Date(w.date).toISOString().slice(0, 10)));
  let streak = 0;
  const d = new Date();
  for (;;) {
    const k = d.toISOString().slice(0, 10);
    if (days.has(k)) { streak++; d.setDate(d.getDate() - 1); } else break;
  }

  // longest
  const sorted = Array.from(days).sort();
  let longest = 0, cur = 0, prev: number | null = null;
  for (const k of sorted) {
    const t = +new Date(k);
    if (prev !== null && t - prev === 86_400_000) cur++; else cur = 1;
    if (cur > longest) longest = cur;
    prev = t;
  }

  return {
    sessions: week.length,
    minutes,
    streak,
    longestStreak: longest,
    goal,
    goalProgress: Math.min(1, week.length / goal),
  };
}

export function getInsight(history: WorkoutEntry[], fb: LastFeedback | null): { title: string; detail: string } | null {
  if (fb && typeof fb.overallScore === "number") {
    return {
      title: `${fb.exerciseName}: ${Math.round(fb.overallScore)}/100`,
      detail: fb.verdict || "Última análise registrada.",
    };
  }
  if (history.length === 0) return null;
  const total = history.reduce((s, w) => s + (w.durationMinutes || 0), 0);
  return { title: `${total} min totais`, detail: `${history.length} sessões registradas.` };
}

export function getBadges(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_BADGES) || "[]"); } catch { return []; }
}

export function syncBadges(streak: number): string[] {
  const milestones = [3, 7, 14, 30, 60, 100];
  const earned = milestones.filter((m) => streak >= m).map((m) => `streak_${m}`);
  try { localStorage.setItem(KEY_BADGES, JSON.stringify(earned)); } catch {}
  return earned;
}