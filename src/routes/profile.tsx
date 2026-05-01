import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Award, Flame,
  Target, Calendar, Activity, Sparkles, ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { listAnalyses, type AnalysisRow } from "@/server/history.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CourtMind Elite" },
      { name: "description", content: "Your performance evolution, history and milestones." },
    ],
  }),
  loader: () => listAnalyses(),
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Error</p>
        <h1 className="mt-3 text-2xl font-medium">Could not load profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/home" className="mt-6 inline-block text-sm underline">Back home</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center"><Link to="/home">Home</Link></div>
  ),
  component: ProfilePage,
});

type Profile = { name?: string; sport?: string; level?: string; goal?: string };
type WorkoutEntry = { id: string; date: string; title: string; sport?: string; durationMinutes?: number; intensity?: string };

function readProfile(): Profile {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("courtmind.profile") || "{}"); } catch { return {}; }
}
function readWorkouts(): WorkoutEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("courtmind.history.v1") || "[]"); } catch { return []; }
}

function ProfilePage() {
  const router = useRouter();
  const { analyses } = Route.useLoaderData() as { analyses: AnalysisRow[]; error: string | null };

  const [profile, setProfile] = useState<Profile>({});
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  useEffect(() => { setProfile(readProfile()); setWorkouts(readWorkouts()); }, []);

  const scored = useMemo(
    () => analyses
      .filter(a => typeof a.overall_score === "number")
      .slice()
      .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)),
    [analyses]
  );

  // Evolution data — chronological scores
  const evolution = useMemo(
    () => scored.map((a, i) => ({
      i: i + 1,
      label: new Date(a.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
      score: Math.round(a.overall_score || 0),
    })),
    [scored]
  );

  // Sessions per week (last 8 weeks)
  const weekly = useMemo(() => buildWeekly(workouts, scored), [workouts, scored]);

  // Stats
  const last = scored[scored.length - 1];
  const prev = scored[scored.length - 2];
  const trend = last && prev ? (last.overall_score! - prev.overall_score!) : 0;
  const best = scored.reduce((m, a) => Math.max(m, a.overall_score || 0), 0);
  const avg = scored.length ? scored.reduce((s, a) => s + (a.overall_score || 0), 0) / scored.length : 0;
  const streak = computeStreak(workouts);

  // Badges
  const badges = computeBadges({ scored, workouts, best, streak });

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/home" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">Profile</p>
          <button onClick={() => router.invalidate()} className="text-[13px] text-muted-foreground hover:text-foreground">Refresh</button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-32 pt-10 sm:px-8 sm:pt-16">
        {/* Identity */}
        <section className="grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-end">
          <div className="flex items-center gap-5">
            <div className="relative">
              <span className="absolute -inset-0.5 rounded-full platinum-gradient opacity-30 blur-md" aria-hidden />
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-foreground text-2xl font-medium text-background">
                {(profile.name || "S").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Athlete</p>
              <h1 className="mt-2 text-balance text-[clamp(2rem,4vw,3rem)] font-medium leading-[1] tracking-[-0.04em]">
                {profile.name || "Sofia Martins"}
              </h1>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {(profile.sport || "Tennis")} · <span className="capitalize">{profile.level || "intermediate"}</span>
                {profile.goal && <> · {profile.goal}</>}
              </p>
            </div>
          </div>
          <div />
          <Link to="/history" className="hidden lg:inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 text-[13px] hover:bg-foreground/5">
            <Calendar className="h-4 w-4" /> Open archive
          </Link>
        </section>

        {/* KPI strip */}
        <section className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Latest score" value={last ? `${Math.round(last.overall_score!)}` : "—"}
            hint={prev ? `${trend > 0 ? "+" : ""}${trend.toFixed(1)} vs prev` : undefined}
            icon={trend > 0 ? <TrendingUp className="h-4 w-4" /> : trend < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />} />
          <Kpi label="Best score" value={best ? `${Math.round(best)}` : "—"} icon={<Sparkles className="h-4 w-4" />} />
          <Kpi label="Avg. score" value={avg ? avg.toFixed(1) : "—"} icon={<Target className="h-4 w-4" />} />
          <Kpi label="Streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} icon={<Flame className="h-4 w-4" />} />
        </section>

        {/* Evolution chart */}
        <section className="mt-12 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card title="Performance evolution" subtitle={evolution.length ? `${evolution.length} analyses` : "No data yet"}>
            {evolution.length === 0 ? (
              <EmptyChart label="Run an analysis to start your evolution line." />
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolution} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                    <XAxis dataKey="label" stroke="currentColor" strokeOpacity={0.4} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="currentColor" strokeOpacity={0.4} fontSize={11} tickLine={false} axisLine={false} width={32} />
                    <Tooltip
                      cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "var(--muted-foreground)" }}
                    />
                    <Area type="monotone" dataKey="score" stroke="currentColor" strokeWidth={1.5} fill="url(#grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="Sessions per week" subtitle="Last 8 weeks">
            {weekly.every(w => w.sessions === 0) ? (
              <EmptyChart label="Log workouts or analyses to see weekly activity." />
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly} margin={{ top: 10, right: 8, bottom: 0, left: -24 }}>
                    <CartesianGrid stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                    <XAxis dataKey="label" stroke="currentColor" strokeOpacity={0.4} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" strokeOpacity={0.4} fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "currentColor", fillOpacity: 0.05 }}
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                    />
                    <Bar dataKey="sessions" fill="currentColor" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </section>

        {/* Badges */}
        <section className="mt-12">
          <SectionHeader icon={<Award className="h-3.5 w-3.5" />} title="Milestones" hint={`${badges.filter(b => b.earned).length} / ${badges.length}`} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map(b => <BadgeCard key={b.id} badge={b} />)}
          </div>
        </section>

        {/* Recent analyses */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-3">
            <SectionHeader icon={<Activity className="h-3.5 w-3.5" />} title="Recent analyses" />
            <Link to="/history" className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              See all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {scored.length === 0 ? (
              <div className="rounded-2xl border hairline bg-card p-8 text-center text-[14px] text-muted-foreground">
                No analyses yet. <Link to="/analyze" className="underline text-foreground">Run your first one</Link>.
              </div>
            ) : (
              scored.slice().reverse().slice(0, 5).map(a => <RecentRow key={a.id} row={a} />)
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Kpi({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border hairline bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        <span className="text-foreground/70">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-medium tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border hairline bg-card p-5 sm:p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{title}</p>
          {subtitle && <p className="mt-1 text-[12px] text-muted-foreground/80">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-[260px] place-items-center rounded-2xl border hairline border-dashed text-center">
      <p className="max-w-xs text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionHeader({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        {icon} {title}
      </p>
      {hint && <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className={`group rounded-2xl border p-5 transition ${
      badge.earned ? "bg-card hairline" : "bg-card/40 hairline opacity-60"
    }`}>
      <div className="flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-full border ${
          badge.earned ? "border-foreground/40 bg-foreground/5" : "hairline"
        }`}>
          <Award className={`h-4 w-4 ${badge.earned ? "text-foreground" : "text-muted-foreground"}`} />
        </div>
        {badge.earned && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/70">Earned</span>
        )}
      </div>
      <p className="mt-4 text-[14px] font-medium tracking-tight">{badge.title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{badge.detail}</p>
      {!badge.earned && badge.progress != null && (
        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full bg-foreground/60" style={{ width: `${Math.min(100, badge.progress)}%` }} />
        </div>
      )}
    </div>
  );
}

function RecentRow({ row }: { row: AnalysisRow }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border hairline bg-card p-4">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
        </p>
        <p className="mt-1 truncate text-[14px] font-medium tracking-tight">{row.verdict || "Performance review"}</p>
      </div>
      <p className="text-2xl font-medium tracking-tight">{Math.round(row.overall_score ?? 0)}</p>
    </div>
  );
}

/* ---------------- helpers ---------------- */

type Badge = { id: string; title: string; detail: string; earned: boolean; progress?: number };

function computeBadges({
  scored, workouts, best, streak,
}: { scored: AnalysisRow[]; workouts: WorkoutEntry[]; best: number; streak: number }): Badge[] {
  const total = scored.length + workouts.length;
  const improving = scored.length >= 2 && (scored[scored.length - 1].overall_score! >= scored[0].overall_score!);
  return [
    { id: "first", title: "First step", detail: "Complete your first analysis.", earned: scored.length >= 1, progress: scored.length >= 1 ? 100 : 0 },
    { id: "five",  title: "Consistent", detail: "Log 5 sessions in total.", earned: total >= 5, progress: Math.round((total / 5) * 100) },
    { id: "streak3", title: "On a roll", detail: "Train 3 days in a row.", earned: streak >= 3, progress: Math.round((streak / 3) * 100) },
    { id: "best80", title: "Sharp form", detail: "Reach a score of 80+.", earned: best >= 80, progress: Math.round((best / 80) * 100) },
    { id: "improve", title: "Trending up", detail: "Improve from your first analysis.", earned: improving, progress: improving ? 100 : 50 },
    { id: "ten", title: "Committed", detail: "Reach 10 total sessions.", earned: total >= 10, progress: Math.round((total / 10) * 100) },
    { id: "best90", title: "Elite touch", detail: "Reach a score of 90+.", earned: best >= 90, progress: Math.round((best / 90) * 100) },
    { id: "month", title: "One month in", detail: "30 days since your first session.", earned: hasMonth(scored, workouts), progress: hasMonth(scored, workouts) ? 100 : 0 },
  ];
}

function hasMonth(scored: AnalysisRow[], workouts: WorkoutEntry[]) {
  const dates = [...scored.map(s => s.created_at), ...workouts.map(w => w.date)].map(d => +new Date(d));
  if (!dates.length) return false;
  const first = Math.min(...dates);
  return Date.now() - first >= 30 * 24 * 60 * 60 * 1000;
}

function computeStreak(workouts: WorkoutEntry[]) {
  if (!workouts.length) return 0;
  const days = new Set(workouts.map(w => new Date(w.date).toISOString().slice(0, 10)));
  let streak = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function buildWeekly(workouts: WorkoutEntry[], scored: AnalysisRow[]) {
  const buckets: { label: string; sessions: number; start: Date }[] = [];
  const now = new Date();
  // start of current week (Mon)
  const monday = new Date(now);
  const day = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - day);
  monday.setHours(0, 0, 0, 0);

  for (let i = 7; i >= 0; i--) {
    const start = new Date(monday); start.setDate(monday.getDate() - i * 7);
    buckets.push({ label: start.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" }), sessions: 0, start });
  }
  const all = [...workouts.map(w => +new Date(w.date)), ...scored.map(a => +new Date(a.created_at))];
  for (const t of all) {
    for (let i = buckets.length - 1; i >= 0; i--) {
      const s = +buckets[i].start;
      const e = s + 7 * 24 * 60 * 60 * 1000;
      if (t >= s && t < e) { buckets[i].sessions++; break; }
    }
  }
  return buckets.map(({ label, sessions }) => ({ label, sessions }));
}
