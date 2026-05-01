import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Sparkles, Loader2, Flame, Timer, Activity, Check,
  CalendarDays, ChevronRight, Target, RefreshCw, TrendingUp, Play, Trophy, Zap, Layers,
} from "lucide-react";
import { generatePlan, type WeeklyPlan, type DayPlan } from "@/server/plan.functions";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Plan — CourtMind Elite" },
      { name: "description", content: "Generate a weekly training plan tailored to your sport." },
    ],
  }),
  component: PlanPage,
});

const SPORTS = [
  "Tennis",
  "Volleyball",
  "Beach Volleyball",
  "Padel",
  "Basketball",
  "Football",
  "Running",
  "Cycling",
  "Swimming",
  "Strength",
  "CrossFit",
  "Pilates",
  "Yoga",
  "Boxing",
  "MMA",
  "Climbing",
  "Surf",
  "Skate",
  "Golf",
  "Triathlon",
];
const LEVELS: Array<{ id: "beginner"|"intermediate"|"advanced"; label: string; sub: string }> = [
  { id: "beginner", label: "Beginner", sub: "Building base" },
  { id: "intermediate", label: "Intermediate", sub: "Refining form" },
  { id: "advanced", label: "Advanced", sub: "Chasing peak" },
];

function PlanPage() {
  const generate = useServerFn(generatePlan);

  const [sport, setSport] = useState("Tennis");
  const [level, setLevel] = useState<"beginner"|"intermediate"|"advanced">("intermediate");
  const [days, setDays] = useState(4);
  const [minutes, setMinutes] = useState(60);
  const [focus, setFocus] = useState("");

  // Hydrate from onboarding profile (sport, level, goal)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("courtmind.profile");
      if (!raw) return;
      const p = JSON.parse(raw) as { sport?: string; level?: "beginner"|"intermediate"|"advanced"|null; goal?: string };
      if (p.sport) setSport(p.sport);
      if (p.level) setLevel(p.level);
      if (p.goal) setFocus(p.goal);
    } catch {}
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setPlan(null);
    try {
      const res = await generate({
        data: { sport, level, daysPerWeek: days, focus, sessionMinutes: minutes },
      });
      if (res.error) setError(res.error);
      else setPlan(res.plan);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/home" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">Weekly plan</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-32 pt-10 sm:px-8 sm:pt-16">
        {/* What's next + progress */}
        <NextUpAndProgress sport={sport} level={level} plan={plan} />

        {/* Recommended programs */}
        <RecommendedPrograms sport={sport} level={level} />

        {/* Hero */}
        <section className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="animate-float-up">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">AI · Personal coach</p>
            <h1 className="mt-5 text-balance text-[clamp(2.2rem,6vw,4.2rem)] font-medium leading-[0.96] tracking-[-0.04em]">
              Your week, <span className="font-serif italic font-normal text-court-gradient">composed.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Tell us your sport and intent. The AI composes a precise 7-day plan with exercises, instructions and sport-specific cues.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="rounded-3xl border hairline bg-card p-6 sm:p-8">
            <Field label="Sport">
              <div className="flex flex-wrap gap-2">
                {SPORTS.map((s) => (
                  <Chip key={s} active={sport === s} onClick={() => setSport(s)}>{s}</Chip>
                ))}
              </div>
            </Field>

            <Field label="Level">
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={[
                      "rounded-xl border p-3 text-left transition",
                      level === l.id
                        ? "border-court bg-court/10 glow-court-soft"
                        : "hairline hover:border-court/30",
                    ].join(" ")}
                  >
                    <p className={`text-[13px] font-medium ${level === l.id ? "text-court" : ""}`}>{l.label}</p>
                    <p className="text-[11px] text-muted-foreground">{l.sub}</p>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-5">
              <Field label={`Days / week · ${days}`}>
                <Slider value={days} min={2} max={7} onChange={setDays} />
              </Field>
              <Field label={`Session · ${minutes} min`}>
                <Slider value={minutes} min={20} max={120} step={5} onChange={setMinutes} />
              </Field>
            </div>

            <Field label="Focus (optional)">
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. backhand consistency, faster recovery, base building"
                className="w-full rounded-xl border hairline bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-court/50 focus:outline-none focus:ring-1 focus:ring-court/40"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-court px-6 py-4 text-[14px] font-medium text-ink transition hover:opacity-90 glow-court disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Composing your week…</>
              ) : plan ? (
                <><RefreshCw className="h-4 w-4" /> Regenerate plan</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate plan</>
              )}
            </button>

            {error && (
              <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-[13px] text-danger">
                {error}
              </p>
            )}
          </form>
        </section>

        {/* Loading state */}
        {loading && !plan && <LoadingSkeleton />}

        {/* Plan */}
        {plan && (
          <section className="mt-16 animate-float-up">
            <PlanHeader plan={plan} />
            <div className="mt-8 grid gap-4">
              {plan.days.map((d, i) => (
                <DayCard key={i} day={d} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ---------- form pieces ---------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3.5 py-1.5 text-[12px] transition",
        active
          ? "bg-court text-ink border-court glow-court-soft"
          : "hairline text-foreground/85 hover:border-court/40 hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Slider({
  value, min, max, step = 1, onChange,
}: { value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return (
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[var(--court)]"
      style={{ colorScheme: "dark" }}
    />
  );
}

/* ---------- loading skeleton ---------- */
function LoadingSkeleton() {
  return (
    <section className="mt-16">
      <div className="rounded-3xl border hairline bg-card p-8 text-center">
        <div className="relative mx-auto h-14 w-14">
          <div className="absolute inset-0 rounded-full court-gradient opacity-20 blur-xl" />
          <Loader2 className="relative h-14 w-14 animate-spin text-court" />
        </div>
        <p className="mt-6 text-[13px] uppercase tracking-[0.24em] text-court">AI working</p>
        <h3 className="mt-2 text-balance text-[clamp(1.4rem,2.5vw,1.8rem)] font-medium tracking-tight">
          Composing your <span className="font-serif italic">precise week.</span>
        </h3>
        <p className="mt-2 text-[13px] text-muted-foreground">Sport-specific drills, intensity curve, recovery placement.</p>
      </div>
      <div className="mt-4 grid gap-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border hairline bg-card" />
        ))}
      </div>
    </section>
  );
}

/* ---------- plan header ---------- */
function PlanHeader({ plan }: { plan: WeeklyPlan }) {
  const totalMin = plan.days.reduce((acc, d) => acc + (d.type === "training" ? d.durationMinutes : 0), 0);
  const trainDays = plan.days.filter(d => d.type === "training").length;

  return (
    <div className="overflow-hidden rounded-3xl border hairline bg-card p-7 sm:p-9">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-court/15 text-court glow-court-soft">
          <Sparkles className="h-4 w-4" />
        </span>
        <p className="text-[11px] uppercase tracking-[0.24em] text-court">{plan.sport} · {plan.level}</p>
      </div>
      <h2 className="mt-5 text-balance text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-tight tracking-tight">
        {plan.weeklyGoal}
      </h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">{plan.overview}</p>

      <div className="mt-7 grid gap-px overflow-hidden rounded-2xl border hairline bg-foreground/10 sm:grid-cols-3">
        <Stat icon={<CalendarDays className="h-4 w-4" />} label="Training days" value={`${trainDays}`} />
        <Stat icon={<Timer className="h-4 w-4" />} label="Weekly volume" value={`${Math.floor(totalMin / 60)}h ${totalMin % 60}m`} />
        <Stat icon={<Target className="h-4 w-4" />} label="Approach" value="Progressive" />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        <span className="text-court">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-medium tracking-tight">{value}</p>
    </div>
  );
}

/* ---------- day card ---------- */
function DayCard({ day, index }: { day: DayPlan; index: number }) {
  const [open, setOpen] = useState(index === 0);

  const isRest = day.type === "rest";
  const isRecovery = day.type === "recovery";

  const intensityColor =
    day.intensity === "High" ? "text-danger" :
    day.intensity === "Medium" ? "text-warn" : "text-success";

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border bg-card transition",
        open ? "border-court/40 glow-court-soft" : "hairline hover:border-court/20",
      ].join(" ")}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid w-full grid-cols-12 items-center gap-3 p-5 text-left"
      >
        <div className="col-span-2 sm:col-span-1">
          <p className="font-serif text-2xl italic text-court">{day.day}</p>
        </div>
        <div className="col-span-7 sm:col-span-6">
          <p className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
            {isRest ? "Rest" : isRecovery ? "Recovery" : "Training"}
          </p>
          <p className="mt-0.5 text-[15px] font-medium tracking-tight">{day.title}</p>
        </div>
        <div className="col-span-3 sm:col-span-4 flex flex-wrap items-center justify-end gap-x-5 gap-y-1 text-[12px]">
          {!isRest && (
            <>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Timer className="h-3.5 w-3.5" /> {day.durationMinutes}m
              </span>
              <span className={`inline-flex items-center gap-1.5 ${intensityColor}`}>
                <Flame className="h-3.5 w-3.5" /> {day.intensity}
              </span>
            </>
          )}
        </div>
        <ChevronRight className={`col-span-12 sm:col-span-1 ml-auto h-4 w-4 text-muted-foreground transition ${open ? "rotate-90 text-court" : ""}`} />
      </button>

      {open && !isRest && (
        <div className="border-t hairline px-5 pb-6 pt-5 sm:px-7">
          {/* Warmup */}
          <Block label="Warm-up" icon={<Activity className="h-3.5 w-3.5" />}>
            <p className="text-[14px] leading-relaxed text-foreground/85">{day.warmup}</p>
          </Block>

          {/* Exercises */}
          {day.exercises.length > 0 && (
            <Block label="Exercises" icon={<Check className="h-3.5 w-3.5" />}>
              <ol className="divide-y hairline">
                {day.exercises.map((ex, i) => (
                  <li key={i} className="grid grid-cols-12 items-start gap-3 py-3">
                    <span className="col-span-1 mt-1 font-serif text-[13px] italic text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="col-span-11 sm:col-span-7">
                      <p className="text-[14px] font-medium">{ex.name}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{ex.instructions}</p>
                    </div>
                    <div className="col-span-12 sm:col-span-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] sm:justify-end">
                      {ex.sets && <span className="text-foreground/85">{ex.sets}</span>}
                      {ex.duration && <span className="text-foreground/85">{ex.duration}</span>}
                      <span className="rounded-full bg-court/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-court">
                        {ex.focus}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {/* Cooldown */}
          <Block label="Cool-down" icon={<Activity className="h-3.5 w-3.5" />}>
            <p className="text-[14px] leading-relaxed text-foreground/85">{day.cooldown}</p>
          </Block>

          {/* Coach note */}
          {day.coachNote && (
            <div className="mt-5 rounded-xl border hairline bg-background/40 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-court">Coach note</p>
              <p className="mt-2 text-[14px] leading-relaxed text-foreground/90">{day.coachNote}</p>
            </div>
          )}
        </div>
      )}

      {open && isRest && (
        <div className="border-t hairline px-5 py-5 text-[14px] text-muted-foreground sm:px-7">
          {day.coachNote || "Full rest. Recovery is part of the work."}
        </div>
      )}
    </div>
  );
}

function Block({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        <span className="text-court">{icon}</span> {label}
      </p>
      {children}
    </div>
  );
}

/* ---------- Up next + estimated progress ---------- */
function NextUpAndProgress({
  sport,
  level,
  plan,
}: {
  sport: string;
  level: "beginner" | "intermediate" | "advanced";
  plan: WeeklyPlan | null;
}) {
  // Pick "next" training day from the plan if available, otherwise show a placeholder.
  const nextDay =
    plan?.days.find((d) => d.type === "training") ?? null;

  // Locally-tracked weekly check-ins (frontend only) for an honest progress estimate.
  const [done, setDone] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("courtmind.progress.v1");
      if (raw) setDone(Math.max(0, Math.min(7, Number(JSON.parse(raw).done) || 0)));
    } catch {}
  }, []);
  const target = plan?.days.filter((d) => d.type === "training").length || 4;
  const completion = Math.min(100, Math.round((done / Math.max(1, target)) * 100));

  // Estimated weeks to next milestone — simple heuristic by level.
  const weeksToMilestone =
    level === "beginner" ? 8 : level === "intermediate" ? 6 : 4;
  const milestone =
    level === "beginner"
      ? "Intermediate base"
      : level === "intermediate"
      ? "Advanced conditioning"
      : "Peak performance block";

  const markSession = () => {
    const next = Math.min(target, done + 1);
    setDone(next);
    try {
      localStorage.setItem("courtmind.progress.v1", JSON.stringify({ done: next }));
    } catch {}
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      {/* Up next */}
      <div className="rounded-3xl border hairline bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <Zap className="h-3.5 w-3.5" /> Up next
          </p>
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {sport}
          </span>
        </div>

        <h2 className="mt-4 text-balance text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-tight tracking-tight">
          {nextDay ? (
            <>
              {nextDay.day} ·{" "}
              <span className="font-serif italic text-platinum-gradient">
                {nextDay.title}
              </span>
            </>
          ) : (
            <>
              Generate your week to see{" "}
              <span className="font-serif italic text-platinum-gradient">
                what's next.
              </span>
            </>
          )}
        </h2>

        {nextDay ? (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" /> {nextDay.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" /> {nextDay.intensity} intensity
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> {nextDay.exercises.length} exercises
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={markSession}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-[13px] font-medium text-background transition hover:opacity-90"
              >
                <Play className="h-4 w-4" /> Start session
              </button>
              <button
                type="button"
                onClick={markSession}
                className="inline-flex items-center gap-2 rounded-full border hairline px-5 py-3 text-[13px] text-foreground transition hover:bg-foreground/5"
              >
                <Check className="h-4 w-4" /> Mark as done
              </button>
            </div>
          </>
        ) : (
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
            Configure your sport and intent below, hit generate, and we'll surface
            the next session here automatically.
          </p>
        )}
      </div>

      {/* Estimated progress */}
      <div className="rounded-3xl border hairline bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Estimated progress
          </p>
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            This week
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <p className="text-[clamp(2.4rem,4vw,3.4rem)] font-medium leading-none tracking-[-0.04em]">
            {completion}
            <span className="text-[40%] text-muted-foreground">%</span>
          </p>
          <p className="text-right text-[12px] text-muted-foreground">
            {done} / {target}
            <br />
            sessions
          </p>
        </div>

        <div className="mt-4 h-[6px] w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-700"
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-foreground/10">
          <div className="bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Next milestone
            </p>
            <p className="mt-2 text-[14px] font-medium tracking-tight">{milestone}</p>
          </div>
          <div className="bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Estimated
            </p>
            <p className="mt-2 text-[14px] font-medium tracking-tight">
              ~{weeksToMilestone} weeks
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Recommended programs ---------- */
type Program = {
  id: string;
  title: string;
  weeks: number;
  sessionsPerWeek: number;
  level: "beginner" | "intermediate" | "advanced" | "all";
  tag: string;
  blurb: string;
};

const PROGRAMS_BY_SPORT: Record<string, Program[]> = {
  Tennis: [
    { id: "t1", title: "Baseline foundations", weeks: 6, sessionsPerWeek: 4, level: "beginner", tag: "Technique", blurb: "Groundstroke consistency, footwork patterns and serve mechanics." },
    { id: "t2", title: "Match-ready conditioning", weeks: 8, sessionsPerWeek: 5, level: "intermediate", tag: "Performance", blurb: "Power, agility and tactical drills built around real match demands." },
    { id: "t3", title: "Tournament peak block", weeks: 4, sessionsPerWeek: 6, level: "advanced", tag: "Peak", blurb: "Sharpening serve, return and recovery for competition weeks." },
  ],
  Volleyball: [
    { id: "v1", title: "Vertical jump program", weeks: 8, sessionsPerWeek: 4, level: "all", tag: "Power", blurb: "Plyometrics, posterior chain and landing mechanics for higher jumps." },
    { id: "v2", title: "Attacker fundamentals", weeks: 6, sessionsPerWeek: 4, level: "intermediate", tag: "Technique", blurb: "Approach, arm swing and shoulder durability for cleaner spikes." },
    { id: "v3", title: "Defensive specialist", weeks: 6, sessionsPerWeek: 3, level: "intermediate", tag: "Reactivity", blurb: "Reaction, platform control and read-defense drills." },
  ],
  Running: [
    { id: "r1", title: "5K progression", weeks: 8, sessionsPerWeek: 4, level: "beginner", tag: "Endurance", blurb: "Easy base, tempo work and one quality session per week." },
    { id: "r2", title: "Half-marathon build", weeks: 12, sessionsPerWeek: 5, level: "intermediate", tag: "Endurance", blurb: "Threshold, long runs and strength to keep form under fatigue." },
    { id: "r3", title: "Speed & VO₂ block", weeks: 6, sessionsPerWeek: 5, level: "advanced", tag: "Performance", blurb: "Intervals, hill repeats and neuromuscular work for top-end speed." },
  ],
  Strength: [
    { id: "s1", title: "Hypertrophy foundations", weeks: 8, sessionsPerWeek: 4, level: "beginner", tag: "Volume", blurb: "Compound lifts, accessories and progressive overload basics." },
    { id: "s2", title: "Powerbuilding", weeks: 10, sessionsPerWeek: 4, level: "intermediate", tag: "Performance", blurb: "Heavy main lifts, hypertrophy accessories and athletic conditioning." },
    { id: "s3", title: "Peak strength", weeks: 6, sessionsPerWeek: 4, level: "advanced", tag: "Peak", blurb: "Intensity blocks targeting one-rep max progress with smart deloads." },
  ],
};

const DEFAULT_PROGRAMS: Program[] = [
  { id: "d1", title: "Athletic base builder", weeks: 6, sessionsPerWeek: 4, level: "beginner", tag: "Foundation", blurb: "General athleticism, mobility and aerobic base for any sport." },
  { id: "d2", title: "Sport-specific conditioning", weeks: 8, sessionsPerWeek: 4, level: "intermediate", tag: "Performance", blurb: "Power, agility and capacity tailored to your discipline." },
  { id: "d3", title: "Recovery & longevity", weeks: 4, sessionsPerWeek: 3, level: "all", tag: "Recovery", blurb: "Mobility, soft-tissue work and easy aerobic flushes." },
];

function RecommendedPrograms({
  sport,
  level,
}: {
  sport: string;
  level: "beginner" | "intermediate" | "advanced";
}) {
  const list = (PROGRAMS_BY_SPORT[sport] ?? DEFAULT_PROGRAMS)
    .slice()
    .sort((a, b) => {
      const score = (p: Program) => (p.level === level ? 0 : p.level === "all" ? 1 : 2);
      return score(a) - score(b);
    });

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> Recommended programs
          </p>
          <h2 className="mt-3 text-balance text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-tight tracking-tight">
            Multi-week paths for{" "}
            <span className="font-serif italic text-platinum-gradient">{sport}.</span>
          </h2>
        </div>
        <p className="hidden text-right text-[12px] text-muted-foreground sm:block">
          Tailored to <span className="text-foreground">{level}</span> level
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProgramCard key={p.id} program={p} highlighted={p.level === level} />
        ))}
      </div>
    </section>
  );
}

function ProgramCard({ program, highlighted }: { program: Program; highlighted: boolean }) {
  const totalSessions = program.weeks * program.sessionsPerWeek;
  return (
    <div
      className={[
        "group relative flex h-full flex-col rounded-3xl border bg-card p-6 transition",
        highlighted ? "border-foreground/30 glow-soft" : "hairline hover:border-foreground/20",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full border hairline px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {program.tag}
        </span>
        {highlighted && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/80">
            Recommended
          </span>
        )}
      </div>

      <h3 className="mt-5 text-[clamp(1.2rem,1.6vw,1.4rem)] font-medium leading-tight tracking-tight">
        {program.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {program.blurb}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2 border-t hairline pt-4 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Weeks</p>
          <p className="mt-1 text-[15px] font-medium">{program.weeks}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Per week</p>
          <p className="mt-1 text-[15px] font-medium">{program.sessionsPerWeek}×</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Total</p>
          <p className="mt-1 text-[15px] font-medium">{totalSessions}</p>
        </div>
      </div>

      <button
        type="button"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border hairline px-4 py-2.5 text-[13px] text-foreground transition group-hover:bg-foreground group-hover:text-background"
      >
        Start program <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}