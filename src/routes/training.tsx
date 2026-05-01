import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import sportTennis from "@/assets/sport-tennis.jpg";
import sportGym from "@/assets/sport-gym.jpg";
import sportRunning from "@/assets/sport-running.jpg";
import sportFootball from "@/assets/sport-football.jpg";
import train1 from "@/assets/train-1.jpg";
import train2 from "@/assets/train-2.jpg";
import {
  addSessionLog,
  getWeekCheckIns,
  saveDailyCheckIn,
  isoDate,
  weekStart,
  type SessionLog,
} from "@/lib/sessionStore";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Training — CourtMind Elite" },
      { name: "description", content: "Sessions, daily check-in and progress charts." },
    ],
  }),
  component: TrainingPage,
});

/* ---------- types ---------- */
type Session = {
  id: string;
  title: string;
  sport: string;
  duration: string;
  durationMinutes: number;
  intensity: "Low" | "Medium" | "High";
  status: "done" | "today" | "upcoming";
  day: string;
  img: string;
};

const initialSessions: Session[] = [
  { id: "s1", title: "Crosscourt rally", sport: "Tennis", duration: "1h 10m", durationMinutes: 70, intensity: "Medium", status: "done", day: "Mon", img: sportTennis },
  { id: "s2", title: "Athletic power", sport: "Strength", duration: "55 min", durationMinutes: 55, intensity: "High", status: "done", day: "Tue", img: sportGym },
  { id: "s3", title: "Recovery flow", sport: "Mobility", duration: "30 min", durationMinutes: 30, intensity: "Low", status: "done", day: "Wed", img: train2 },
  { id: "s4", title: "Baseline rhythm & footwork", sport: "Tennis", duration: "1h 10m", durationMinutes: 70, intensity: "Medium", status: "today", day: "Thu", img: sportTennis },
  { id: "s5", title: "Sprint intervals", sport: "Running", duration: "40 min", durationMinutes: 40, intensity: "High", status: "upcoming", day: "Fri", img: sportRunning },
  { id: "s6", title: "Long run · easy pace", sport: "Running", duration: "1h 20m", durationMinutes: 80, intensity: "Low", status: "upcoming", day: "Sat", img: train1 },
  { id: "s7", title: "Match simulation", sport: "Football", duration: "1h 30m", durationMinutes: 90, intensity: "High", status: "upcoming", day: "Sun", img: sportFootball },
];

const STATUS_KEY = "courtmind.training.status.v1";
const HISTORY_KEY = "courtmind.history.v1";

type StoredStatus = Record<string, { status: Session["status"]; completedAt?: string; logId?: string }>;
type WorkoutEntry = {
  id: string; date: string; title: string; sport?: string;
  durationMinutes?: number; intensity?: "Low" | "Medium" | "High"; note?: string;
};

function readStatus(): StoredStatus {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) || "{}"); } catch { return {}; }
}
function writeStatus(s: StoredStatus) {
  try { localStorage.setItem(STATUS_KEY, JSON.stringify(s)); } catch {}
}
function readHistory(): WorkoutEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function writeHistory(h: WorkoutEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    // notify same-tab listeners (storage event only fires across tabs)
    window.dispatchEvent(new CustomEvent("courtmind:history-updated"));
  } catch {}
}

/* ---------- page ---------- */
function TrainingPage() {
  const [tab, setTab] = useState<"all" | "done" | "today" | "upcoming">("all");
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  // Hydrate persisted status on mount.
  useEffect(() => {
    const stored = readStatus();
    setSessions((prev) =>
      prev.map((s) => (stored[s.id] ? { ...s, status: stored[s.id].status } : s))
    );
  }, []);

  const completeSession = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (!target || target.status === "done") return;

    const logId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. update session list
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "done" } : s)));

    // 2. persist status
    const stored = readStatus();
    stored[id] = { status: "done", completedAt: now, logId };
    writeStatus(stored);

    // 3. add to shared workout history (drives /profile + /history charts)
    const history = readHistory();
    history.unshift({
      id: logId,
      date: now,
      title: target.title,
      sport: target.sport,
      durationMinutes: target.durationMinutes,
      intensity: target.intensity,
    });
    writeHistory(history);
  };

  const undoSession = (id: string) => {
    const stored = readStatus();
    const entry = stored[id];
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.id === "s4" ? "today" : "upcoming" } : s))
    );
    // Remove the auto-logged history entry if we created it.
    if (entry?.logId) {
      const history = readHistory().filter((h) => h.id !== entry.logId);
      writeHistory(history);
    }
    delete stored[id];
    writeStatus(stored);
  };

  const filtered = useMemo(
    () => (tab === "all" ? sessions : sessions.filter((s) => s.status === tab)),
    [tab, sessions]
  );

  // Derive live stats from sessions for the trio.
  const doneCount = sessions.filter((s) => s.status === "done").length;
  const totalCount = sessions.length;
  const minutesDone = sessions
    .filter((s) => s.status === "done")
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const volumeLabel = minutesDone >= 60
    ? `${Math.floor(minutesDone / 60)}h ${minutesDone % 60}m`
    : `${minutesDone} min`;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/home" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
             Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">Training</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-32 pt-10 sm:px-8 sm:pt-16">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Week 06 · Block II</p>
            <h1 className="mt-5 text-balance text-[clamp(2.2rem,6vw,4.4rem)] font-medium leading-[0.96] tracking-[-0.04em]">
              Train with <span className="font-serif italic font-normal text-court-gradient">composure.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Seven sessions composed for this week. Check in every day to keep momentum honest.
            </p>
          </div>

          {/* Daily check-in */}
          <DailyCheckIn />
        </section>

        {/* Stats trio */}
        <section className="mt-14 grid gap-px overflow-hidden rounded-2xl border hairline bg-foreground/10 sm:grid-cols-3">
          <StatTile label="This week" value={`${doneCount}`} unit={`/ ${totalCount} sessions`} delta={doneCount === totalCount ? "Week complete" : "On track"} />
          <StatTile label="Volume" value={volumeLabel} unit="trained" delta={`${doneCount} session${doneCount === 1 ? "" : "s"} logged`} />
          <StatTile label="Streak" value="14" unit="days" delta="Personal best" />
        </section>

        {/* Charts */}
        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          <ChartCard
            title="Performance"
            sub="Last 9 sessions"
            metric="82"
            unit="/ 100"
            chart={<LineChart values={[40, 48, 44, 52, 60, 58, 70, 74, 82]} />}
          />
          <ChartCard
            title="Volume by week"
            sub="Minutes trained"
            metric="5h 25m"
            unit="this week"
            chart={<BarsChart values={[140, 195, 168, 240, 210, 285, 325]} labels={["W1","W2","W3","W4","W5","W6","W7"]} />}
          />
          <ChartCard
            title="Consistency"
            sub="Last 14 days"
            metric="94%"
            unit="check-ins"
            chart={<DotsChart count={14} active={12} />}
          />
        </section>

        {/* Sessions list */}
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Sessions</p>
              <h2 className="mt-2 text-3xl font-medium tracking-tight">
                Your week, <span className="font-serif italic">composed.</span>
              </h2>
            </div>
            <Tabs tab={tab} setTab={setTab} />
          </div>

          <ul className="mt-6 space-y-3">
            {filtered.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                onComplete={() => completeSession(s.id)}
                onUndo={() => undoSession(s.id)}
              />
            ))}
            {filtered.length === 0 && (
              <li className="rounded-2xl border hairline bg-card p-10 text-center text-[14px] text-muted-foreground">
                Nothing here yet.
              </li>
            )}
          </ul>
        </section>

        {/* AI weekly note */}
        <section className="mt-14 overflow-hidden rounded-2xl border hairline bg-card p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-court/15 text-court glow-court-soft">
              
            </span>
            <p className="text-[11px] uppercase tracking-[0.24em] text-court">Coach note</p>
          </div>
          <p className="mt-5 max-w-3xl text-balance text-[clamp(1.2rem,2vw,1.6rem)] leading-snug font-light">
            You've held a clean rhythm across the last two blocks. <span className="font-serif italic">Don't add load yet</span> — let consistency compound through the weekend.
          </p>
        </section>
      </main>
    </div>
  );
}

/* ---------- Daily check-in ---------- */
function DailyCheckIn() {
  const [days, setDays] = useState<boolean[]>([true, true, true, true, false, false, false]);
  const [today, setToday] = useState(3); // Thursday
  const [energy, setEnergy] = useState(3);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  useEffect(() => {
    setToday(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  }, []);

  const checkIn = () => {
    setDays((d) => d.map((v, i) => (i === today ? true : v)));
  };
  const checkedToday = days[today];

  return (
    <div className="rounded-3xl border hairline glass p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Daily check-in</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Streak · 14d</p>
      </div>

      {/* week dots */}
      <div className="mt-5 grid grid-cols-7 gap-2">
        {days.map((done, i) => {
          const isToday = i === today;
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <span
                className={[
                  "grid h-9 w-9 place-items-center rounded-full text-[12px] font-medium transition",
                  done
                    ? "bg-court text-ink glow-court-soft"
                    : isToday
                      ? "border border-court/60 text-court animate-pulse-court"
                      : "border hairline text-muted-foreground",
                ].join(" ")}
              >
                {done ? "✓" : labels[i]}
              </span>
              <span className={`text-[10px] uppercase tracking-[0.2em] ${isToday ? "text-court" : "text-muted-foreground"}`}>
                {isToday ? "today" : labels[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* energy slider */}
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Energy today</p>
          <p className="text-[12px] text-foreground">{["Very low","Low","Steady","Good","Peak"][energy]}</p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {[0,1,2,3,4].map((i) => (
            <button
              key={i}
              onClick={() => setEnergy(i)}
              className={[
                "h-1.5 flex-1 rounded-full transition",
                i <= energy ? "bg-court glow-court-soft" : "bg-foreground/10 hover:bg-foreground/20",
              ].join(" ")}
              aria-label={`Energy ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={checkIn}
        disabled={checkedToday}
        className={[
          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-medium transition",
          checkedToday
            ? "border hairline text-muted-foreground"
            : "bg-court text-ink hover:opacity-90 glow-court",
        ].join(" ")}
      >
        {checkedToday ? <> Checked in</> : <> Check in for today</>}
      </button>
    </div>
  );
}

/* ---------- Stat tile ---------- */
function StatTile({ label, value, unit, delta }: { label: string; value: string; unit: string; delta: string }) {
  return (
    <div className="bg-background p-7">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        
      </div>
      <p className="mt-8 flex items-baseline gap-2">
        <span className="text-5xl font-medium tracking-[-0.03em] leading-none">{value}</span>
        <span className="text-[13px] text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-3 text-[12px] text-court">{delta}</p>
    </div>
  );
}

/* ---------- Tabs ---------- */
function Tabs({
  tab, setTab,
}: { tab: string; setTab: (t: "all"|"done"|"today"|"upcoming") => void }) {
  const items: { id: "all"|"done"|"today"|"upcoming"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "done", label: "Completed" },
  ];
  return (
    <div className="inline-flex rounded-full border hairline bg-card p-1">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => setTab(it.id)}
          className={[
            "rounded-full px-4 py-1.5 text-[12px] font-medium transition",
            tab === it.id
              ? "bg-court text-ink"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Session row ---------- */
function SessionRow({
  session,
  onComplete,
  onUndo,
}: {
  session: Session;
  onComplete: () => void;
  onUndo: () => void;
}) {
  const intensityColor =
    session.intensity === "High" ? "text-danger" :
    session.intensity === "Medium" ? "text-warn" : "text-success";

  return (
    <li
      className={[
        "group relative grid grid-cols-12 items-center gap-4 overflow-hidden rounded-2xl border hairline bg-card p-3 sm:p-4 transition",
        session.status === "today" ? "ring-1 ring-court/40 glow-court-soft" : "hover:border-court/30",
      ].join(" ")}
    >
      {/* thumbnail */}
      <div className="col-span-3 sm:col-span-2 relative aspect-[4/3] overflow-hidden rounded-xl">
        <img src={session.img} alt={session.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
        <span className="absolute left-2 top-2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
          {session.day}
        </span>
      </div>

      {/* main */}
      <div className="col-span-9 sm:col-span-5">
        <div className="flex items-center gap-2">
          <p className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">{session.sport}</p>
          {session.status === "today" && (
            <span className="rounded-full bg-court/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-court">Today</span>
          )}
          {session.status === "done" && (
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-success">Done</span>
          )}
        </div>
        <p className="mt-1 text-[15px] font-medium tracking-tight">{session.title}</p>
      </div>

      {/* meta */}
      <div className="col-span-12 sm:col-span-4 flex flex-wrap items-center gap-x-6 gap-y-1 sm:justify-end">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
           {session.duration}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-[12px] ${intensityColor}`}>
           {session.intensity}
        </span>
      </div>

      {/* action */}
      <div className="col-span-12 sm:col-span-1 flex justify-end">
        {session.status === "done" ? (
          <button
            type="button"
            onClick={onUndo}
            aria-label="Mark as not done"
            title="Undo completion"
            className="grid h-10 w-10 place-items-center rounded-full bg-success/15 text-[11px] font-medium uppercase tracking-[0.18em] text-success transition hover:bg-foreground/10 hover:text-foreground"
          >
            ✓
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            aria-label="Mark session as done"
            title="Mark as done"
            className={[
              "grid h-10 w-10 place-items-center rounded-full text-[11px] font-medium uppercase tracking-[0.18em] transition",
              session.status === "today"
                ? "bg-court text-ink glow-court animate-pulse-court"
                : "border hairline text-foreground hover:bg-foreground hover:text-background hover:border-foreground",
            ].join(" ")}
          >
            Go
          </button>
        )}
      </div>
    </li>
  );
}

/* ---------- Chart card ---------- */
function ChartCard({
  title, sub, metric, unit, chart,
}: { title: string; sub: string; metric: string; unit: string; chart: React.ReactNode }) {
  return (
    <div className="rounded-2xl border hairline bg-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{title}</p>
          <p className="mt-1 text-[12px] text-muted-foreground/70">{sub}</p>
        </div>
        
      </div>
      <p className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-medium tracking-[-0.03em] leading-none">{metric}</span>
        <span className="text-[12px] text-muted-foreground">{unit}</span>
      </p>
      <div className="mt-6 h-24">{chart}</div>
    </div>
  );
}

/* ---------- charts ---------- */
function LineChart({ values }: { values: number[] }) {
  const w = 280, h = 90;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
    return [x, y] as const;
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]},${p[1]}`).join(" ");
  const area = `${path} L ${w},${h} L 0,${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--court)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--court)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lineFill)" />
      <path
        d={path} fill="none" stroke="var(--court)" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px var(--court))" }}
      />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--court)" />
      <circle cx={last[0]} cy={last[1]} r="6" fill="var(--court)" opacity="0.25" />
    </svg>
  );
}

function BarsChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-full items-end gap-2">
      {values.map((v, i) => {
        const isLast = i === values.length - 1;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={[
                "w-full rounded-sm transition",
                isLast ? "bg-court glow-court-soft" : "bg-foreground/15 group-hover:bg-foreground/25",
              ].join(" ")}
              style={{ height: `${(v / max) * 100}%` }}
            />
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

function DotsChart({ count, active }: { count: number; active: number }) {
  return (
    <div className="grid h-full grid-cols-7 place-items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-3 w-3 rounded-full",
            i < active ? "bg-court glow-court-soft" : "bg-foreground/15",
          ].join(" ")}
        />
      ))}
    </div>
  );
}