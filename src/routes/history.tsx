import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Calendar, Clock, TrendingUp, TrendingDown, Minus,
  Activity, Trash2, GitCompare, Video, Dumbbell,
} from "lucide-react";
import { listAnalyses, type AnalysisRow } from "@/server/history.functions";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — CourtMind Elite" },
      { name: "description", content: "Your archive of analyses and training sessions, organized by date." },
    ],
  }),
  loader: () => listAnalyses(),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background text-foreground grid place-items-center p-8 text-center">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Error</p>
        <h1 className="mt-3 text-2xl font-medium">Could not load history</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/home" className="mt-6 inline-block text-sm underline">Back home</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center"><Link to="/home">Home</Link></div>
  ),
  component: HistoryPage,
});

type WorkoutEntry = {
  id: string;
  date: string; // ISO
  title: string;
  sport?: string;
  durationMinutes?: number;
  intensity?: "Low" | "Medium" | "High";
  note?: string;
};

const WORKOUT_KEY = "courtmind.history.v1";

function readWorkouts(): WorkoutEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WORKOUT_KEY);
    return raw ? (JSON.parse(raw) as WorkoutEntry[]) : [];
  } catch { return []; }
}
function writeWorkouts(entries: WorkoutEntry[]) {
  try { localStorage.setItem(WORKOUT_KEY, JSON.stringify(entries)); } catch {}
}

type Tab = "all" | "analyses" | "workouts";

function HistoryPage() {
  const router = useRouter();
  const { analyses } = Route.useLoaderData() as { analyses: AnalysisRow[]; error: string | null };

  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { setWorkouts(readWorkouts()); }, []);

  const completedAnalyses = useMemo(
    () => analyses.filter(a => a.status === "completed" || a.overall_score != null),
    [analyses]
  );

  // Group by day
  const grouped = useMemo(() => {
    type Item =
      | { kind: "analysis"; date: string; data: AnalysisRow }
      | { kind: "workout"; date: string; data: WorkoutEntry };
    const items: Item[] = [];
    if (tab !== "workouts") {
      for (const a of completedAnalyses) items.push({ kind: "analysis", date: a.created_at, data: a });
    }
    if (tab !== "analyses") {
      for (const w of workouts) items.push({ kind: "workout", date: w.date, data: w });
    }
    items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const key = new Date(it.date).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries());
  }, [completedAnalyses, workouts, tab]);

  // Stats: avg score, trend (last vs previous)
  const avgScore = useMemo(() => {
    const scored = completedAnalyses.filter(a => typeof a.overall_score === "number");
    if (!scored.length) return null;
    return scored.reduce((s, a) => s + (a.overall_score || 0), 0) / scored.length;
  }, [completedAnalyses]);
  const trend = useMemo(() => {
    const scored = completedAnalyses
      .filter(a => typeof a.overall_score === "number")
      .slice() // already desc
    if (scored.length < 2) return 0;
    return (scored[0].overall_score || 0) - (scored[1].overall_score || 0);
  }, [completedAnalyses]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const removeWorkout = (id: string) => {
    const next = workouts.filter(w => w.id !== id);
    setWorkouts(next); writeWorkouts(next);
  };

  const addWorkout = (entry: Omit<WorkoutEntry, "id">) => {
    const next = [{ ...entry, id: crypto.randomUUID() }, ...workouts];
    setWorkouts(next); writeWorkouts(next);
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/home" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">History</p>
          <button
            type="button"
            onClick={() => router.invalidate()}
            className="text-[13px] text-muted-foreground transition hover:text-foreground"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-32 pt-10 sm:px-8 sm:pt-16">
        {/* Hero */}
        <section className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="animate-float-up">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              <Calendar className="mr-2 inline h-3 w-3" /> Archive
            </p>
            <h1 className="mt-5 text-balance text-[clamp(2.2rem,6vw,4.2rem)] font-medium leading-[0.96] tracking-[-0.04em]">
              Every session, <span className="font-serif italic font-normal text-platinum-gradient">remembered.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Browse past analyses and logged training by date. Pick two analyses to compare side-by-side and see how you've evolved.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total analyses" value={`${completedAnalyses.length}`} icon={<Video className="h-4 w-4" />} />
            <StatCard label="Logged workouts" value={`${workouts.length}`} icon={<Dumbbell className="h-4 w-4" />} />
            <StatCard
              label="Avg. score"
              value={avgScore == null ? "—" : avgScore.toFixed(1)}
              icon={
                trend > 0 ? <TrendingUp className="h-4 w-4" /> :
                trend < 0 ? <TrendingDown className="h-4 w-4" /> :
                <Minus className="h-4 w-4" />
              }
              hint={trend === 0 ? undefined : trend > 0 ? `+${trend.toFixed(1)} vs prev` : `${trend.toFixed(1)} vs prev`}
            />
          </div>
        </section>

        {/* Controls */}
        <section className="mt-12 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border hairline p-1 bg-card">
            {([
              { id: "all", label: "All" },
              { id: "analyses", label: "Analyses" },
              { id: "workouts", label: "Workouts" },
            ] as { id: Tab; label: string }[]).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-4 py-1.5 text-[12px] uppercase tracking-[0.18em] transition ${
                  tab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 text-[13px] text-foreground transition hover:bg-foreground hover:text-background"
          >
            <Dumbbell className="h-4 w-4" /> Log a workout
          </button>
        </section>

        {/* Compare strip */}
        {compareIds.length > 0 && (
          <ComparePanel
            ids={compareIds}
            analyses={completedAnalyses}
            onClear={() => setCompareIds([])}
            onRemove={(id) => setCompareIds(prev => prev.filter(x => x !== id))}
          />
        )}

        {/* Timeline */}
        <section className="mt-12">
          {grouped.length === 0 ? (
            <EmptyState />
          ) : (
            <ol className="relative border-l hairline pl-6 sm:pl-8">
              {grouped.map(([day, items]) => (
                <li key={day} className="mb-12 last:mb-0">
                  <span className="absolute -left-[7px] mt-1.5 block h-3 w-3 rounded-full border-2 border-background bg-foreground" />
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    {formatDayLabel(day)}
                  </p>
                  <div className="mt-4 grid gap-3">
                    {items.map((it) =>
                      it.kind === "analysis" ? (
                        <AnalysisCard
                          key={`a-${it.data.id}`}
                          row={it.data}
                          comparing={compareIds.includes(it.data.id)}
                          onCompare={() => toggleCompare(it.data.id)}
                        />
                      ) : (
                        <WorkoutCard
                          key={`w-${it.data.id}`}
                          entry={it.data}
                          onDelete={() => removeWorkout(it.data.id)}
                        />
                      )
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>

      {showAdd && <AddWorkoutModal onClose={() => setShowAdd(false)} onSave={addWorkout} />}
    </div>
  );
}

/* ---------------- pieces ---------------- */

function StatCard({ label, value, icon, hint }: { label: string; value: string; icon: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border hairline bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        <span className="text-foreground/80">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-medium tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border hairline bg-card p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border hairline">
        <Activity className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-xl font-medium tracking-tight">Nothing here yet</h3>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Run an analysis or log a workout — it will appear in your timeline automatically.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/analyze" className="rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-background hover:opacity-90">
          New analysis
        </Link>
        <Link to="/training" className="rounded-full border hairline px-5 py-2.5 text-[13px] hover:bg-foreground/5">
          Go to training
        </Link>
      </div>
    </div>
  );
}

function AnalysisCard({ row, comparing, onCompare }: { row: AnalysisRow; comparing: boolean; onCompare: () => void }) {
  const counts = countEvents(row.events);
  const score = row.overall_score ?? 0;
  return (
    <div className={`group rounded-2xl border bg-card p-5 transition ${comparing ? "border-foreground/40 glow-soft" : "hairline hover:border-foreground/20"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <Video className="h-3.5 w-3.5" /> Analysis
            <span className="text-foreground/40">·</span>
            <Clock className="h-3 w-3" /> {formatTime(row.created_at)}
          </p>
          <h4 className="mt-2 text-[16px] font-medium leading-tight tracking-tight truncate">
            {row.verdict || "Performance review"}
          </h4>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
            <Pill tone="good">{counts.good} good</Pill>
            <Pill tone="warn">{counts.warn} watch</Pill>
            <Pill tone="bad">{counts.bad} fix</Pill>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Score</p>
          <p className="text-3xl font-medium tracking-tight">{Math.round(score)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCompare}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition ${
            comparing ? "bg-foreground text-background border-foreground" : "hairline hover:bg-foreground/5"
          }`}
        >
          <GitCompare className="h-3.5 w-3.5" /> {comparing ? "Selected" : "Compare"}
        </button>
      </div>
    </div>
  );
}

function WorkoutCard({ entry, onDelete }: { entry: WorkoutEntry; onDelete: () => void }) {
  return (
    <div className="rounded-2xl border hairline bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <Dumbbell className="h-3.5 w-3.5" /> Workout
            <span className="text-foreground/40">·</span>
            <Clock className="h-3 w-3" /> {formatTime(entry.date)}
          </p>
          <h4 className="mt-2 text-[16px] font-medium tracking-tight">{entry.title}</h4>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            {entry.sport && <span>{entry.sport}</span>}
            {entry.durationMinutes && <span>{entry.durationMinutes} min</span>}
            {entry.intensity && <span>{entry.intensity} intensity</span>}
          </div>
          {entry.note && <p className="mt-3 text-[13px] leading-relaxed text-foreground/85">{entry.note}</p>}
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Remove"
          className="rounded-full border hairline p-2 text-muted-foreground transition hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ComparePanel({
  ids, analyses, onClear, onRemove,
}: {
  ids: string[];
  analyses: AnalysisRow[];
  onClear: () => void;
  onRemove: (id: string) => void;
}) {
  const picked = ids.map(id => analyses.find(a => a.id === id)).filter(Boolean) as AnalysisRow[];
  const ready = picked.length === 2;
  const [a, b] = picked;
  const diff = ready ? (a.overall_score ?? 0) - (b.overall_score ?? 0) : 0;

  return (
    <section className="mt-8 rounded-3xl border border-foreground/30 bg-card p-6 sm:p-8 glow-soft animate-float-up">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          <GitCompare className="h-3.5 w-3.5" /> Compare
        </p>
        <button onClick={onClear} className="text-[12px] text-muted-foreground hover:text-foreground">Clear</button>
      </div>

      {!ready && (
        <p className="mt-4 text-[14px] text-muted-foreground">
          Select <span className="text-foreground">{2 - picked.length}</span> more analysis to compare.
        </p>
      )}

      {ready && (
        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
          <CompareSide row={a} onRemove={() => onRemove(a.id)} />
          <div className="hidden sm:flex flex-col items-center justify-center px-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Δ score</p>
            <p className={`mt-2 text-4xl font-medium tracking-tight ${diff > 0 ? "" : diff < 0 ? "text-muted-foreground" : ""}`}>
              {diff > 0 ? "+" : ""}{diff.toFixed(1)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {diff > 0 ? "Newer is better" : diff < 0 ? "Older was better" : "No change"}
            </p>
          </div>
          <CompareSide row={b} onRemove={() => onRemove(b.id)} />
        </div>
      )}
    </section>
  );
}

function CompareSide({ row, onRemove }: { row: AnalysisRow; onRemove: () => void }) {
  const c = countEvents(row.events);
  return (
    <div className="rounded-2xl border hairline bg-background/40 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{formatDayLabel(row.created_at)}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{formatTime(row.created_at)}</p>
        </div>
        <button onClick={onRemove} className="text-[11px] text-muted-foreground hover:text-foreground">Remove</button>
      </div>
      <p className="mt-4 text-[40px] font-medium leading-none tracking-[-0.04em]">{Math.round(row.overall_score ?? 0)}</p>
      <p className="mt-2 text-[13px] text-foreground/85 line-clamp-2">{row.verdict || "—"}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Mini label="Good" value={c.good} />
        <Mini label="Watch" value={c.warn} />
        <Mini label="Fix" value={c.bad} />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border hairline bg-card p-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-medium">{value}</p>
    </div>
  );
}

function Pill({ tone, children }: { tone: "good" | "warn" | "bad"; children: React.ReactNode }) {
  const cls =
    tone === "good" ? "border-foreground/30 text-foreground" :
    tone === "warn" ? "border-foreground/20 text-foreground/80" :
    "border-foreground/10 text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${cls} px-2.5 py-0.5 text-[11px]`}>
      {children}
    </span>
  );
}

function AddWorkoutModal({
  onClose, onSave,
}: { onClose: () => void; onSave: (e: Omit<WorkoutEntry, "id">) => void }) {
  const [title, setTitle] = useState("");
  const [sport, setSport] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState<number | "">(60);
  const [intensity, setIntensity] = useState<"Low" | "Medium" | "High">("Medium");
  const [note, setNote] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      sport: sport.trim() || undefined,
      date: new Date(date).toISOString(),
      durationMinutes: typeof duration === "number" ? duration : undefined,
      intensity,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border hairline bg-card p-6 sm:p-8"
      >
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Log a workout</p>
        <h3 className="mt-3 text-2xl font-medium tracking-tight">New session</h3>

        <div className="mt-6 grid gap-4">
          <Input label="Title" value={title} onChange={setTitle} placeholder="Baseline rally" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Sport" value={sport} onChange={setSport} placeholder="Tennis" />
            <Input label="Duration (min)" type="number" value={String(duration)} onChange={(v) => setDuration(v === "" ? "" : Number(v))} />
          </div>
          <Input label="Date & time" type="datetime-local" value={date} onChange={setDate} />
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Intensity</p>
            <div className="grid grid-cols-3 gap-2">
              {(["Low", "Medium", "High"] as const).map(v => (
                <button
                  key={v} type="button" onClick={() => setIntensity(v)}
                  className={`rounded-xl border px-3 py-2 text-[13px] transition ${
                    intensity === v ? "bg-foreground text-background border-foreground" : "hairline hover:bg-foreground/5"
                  }`}
                >{v}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Note</p>
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="How did it feel?"
              className="w-full rounded-xl border hairline bg-background px-4 py-3 text-[14px] focus:border-foreground/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border hairline px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" className="rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-background hover:opacity-90">Save</button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label, value, onChange, placeholder, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border hairline bg-background px-4 py-3 text-[14px] focus:border-foreground/50 focus:outline-none"
      />
    </div>
  );
}

/* ---------------- helpers ---------------- */

function countEvents(events: AnalysisRow["events"]) {
  const c = { good: 0, warn: 0, bad: 0 };
  if (!events) return c;
  for (const e of events) {
    if (e?.type === "good") c.good++;
    else if (e?.type === "warn") c.warn++;
    else if (e?.type === "bad") c.bad++;
  }
  return c;
}

function formatDayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(); yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
