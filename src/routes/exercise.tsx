import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play, Pause, Timer, Flame, Target, ChevronRight, RotateCcw, SkipForward, Check } from "lucide-react";
import heroAthlete from "@/assets/hero-athlete.jpg";

export const Route = createFileRoute("/exercise")({
  head: () => ({
    meta: [
      { title: "Exercise — CourtMind Elite" },
      { name: "description", content: "An exercise rendered with motion clarity." },
    ],
  }),
  component: ExercisePage,
});

/* ---------- Workout config ---------- */
const TOTAL_SETS = 4;
const WORK_SECONDS = 30;
const REST_SECONDS = 15;
const PREP_SECONDS = 5;

type Phase = "idle" | "prep" | "work" | "rest" | "done";

function ExercisePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [setIdx, setSetIdx] = useState(1); // 1-based
  const [remaining, setRemaining] = useState(PREP_SECONDS);
  const [running, setRunning] = useState(false);
  const phaseRef = useRef<Phase>("idle");
  const setRef = useRef(1);

  // keep refs in sync for the interval closure
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { setRef.current = setIdx; }, [setIdx]);

  // tick
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        // transition
        const p = phaseRef.current;
        if (p === "prep") {
          setPhase("work");
          return WORK_SECONDS;
        }
        if (p === "work") {
          if (setRef.current >= TOTAL_SETS) {
            setPhase("done");
            setRunning(false);
            return 0;
          }
          setPhase("rest");
          return REST_SECONDS;
        }
        if (p === "rest") {
          setSetIdx((s) => s + 1);
          setPhase("work");
          return WORK_SECONDS;
        }
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const start = () => {
    if (phase === "idle" || phase === "done") {
      setSetIdx(1);
      setPhase("prep");
      setRemaining(PREP_SECONDS);
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setPhase("idle");
    setSetIdx(1);
    setRemaining(PREP_SECONDS);
  };
  const skip = () => {
    // jump to next phase boundary
    setRemaining(1);
  };

  const isActive = phase !== "idle" && phase !== "done";
  const totalForPhase =
    phase === "prep" ? PREP_SECONDS :
    phase === "work" ? WORK_SECONDS :
    phase === "rest" ? REST_SECONDS : PREP_SECONDS;
  const progress = isActive ? 1 - remaining / totalForPhase : phase === "done" ? 1 : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground antialiased">
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-court/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[40vh] w-[40vh] rounded-full bg-court/8 blur-[100px]" />
        <div className="absolute inset-0 grain opacity-60" />
      </div>

      {/* top bar */}
      <header className="relative z-20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/home" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">Exercise · 03 of 12</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20 lg:pt-12">
        {/* LEFT — copy + controls */}
        <div className="animate-float-up order-2 lg:order-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Footwork · Tennis</p>
          <h1 className="mt-5 text-balance text-[clamp(2.6rem,8vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.045em]">
            Lateral
            <br />
            <span className="font-serif italic font-normal text-court-gradient">split-step.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Quick lateral hops with a controlled landing. Keeps the body loaded and ready for the next shot.
          </p>

          {/* meta row */}
          <ul className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border hairline bg-foreground/10">
            <Meta icon={<Timer className="h-4 w-4" />} label="Duration" value={`${TOTAL_SETS} × ${WORK_SECONDS}s`} />
            <Meta icon={<Flame className="h-4 w-4" />} label="Intensity" value="High" />
            <Meta icon={<Target className="h-4 w-4" />} label="Focus" value="Reaction" />
          </ul>

          {/* Execution mode — timer & controls */}
          <TimerPanel
            phase={phase}
            setIdx={setIdx}
            remaining={remaining}
            progress={progress}
            running={running}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skip}
          />

          {/* steps */}
          <ol className="mt-10 divide-y hairline border-y hairline">
            {[
              { n: "I", t: "Stance", d: "Feet shoulder-width, knees soft." },
              { n: "II", t: "Hop", d: "Light split-step, both feet leave the ground." },
              { n: "III", t: "Land", d: "Quiet contact, weight on the balls of the feet." },
              { n: "IV", t: "Reset", d: "Reload immediately — repeat for the full set." },
            ].map((s) => (
              <li key={s.n} className="grid grid-cols-12 items-center gap-4 py-4">
                <span className="col-span-1 font-serif text-lg italic text-muted-foreground">{s.n}</span>
                <p className="col-span-4 text-[14px] font-medium">{s.t}</p>
                <p className="col-span-7 text-[13px] text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* RIGHT — figure with neon motion lines */}
        <div className="relative order-1 lg:order-2">
          <FigureNeon />
        </div>
      </main>
    </div>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="bg-background p-5">
      <span className="grid h-8 w-8 place-items-center rounded-full border hairline text-court">{icon}</span>
      <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[15px] font-medium tracking-tight">{value}</p>
    </li>
  );
}

/* ---------- Timer execution panel ---------- */
function TimerPanel({
  phase, setIdx, remaining, progress, running,
  onStart, onPause, onReset, onSkip,
}: {
  phase: Phase; setIdx: number; remaining: number; progress: number; running: boolean;
  onStart: () => void; onPause: () => void; onReset: () => void; onSkip: () => void;
}) {
  const phaseLabel =
    phase === "idle" ? "Ready" :
    phase === "prep" ? "Get ready" :
    phase === "work" ? "Work" :
    phase === "rest" ? "Rest" : "Complete";

  // SVG ring geometry
  const size = 220;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - progress);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="mt-10 overflow-hidden rounded-3xl border hairline bg-card p-7">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Execution mode</p>
        <p className="text-[11px] uppercase tracking-[0.24em] text-court">
          Set {Math.min(setIdx, TOTAL_SETS)} / {TOTAL_SETS}
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        {/* ring */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke="currentColor"
              className="text-foreground/10" strokeWidth={stroke}
            />
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke="currentColor"
              className={
                phase === "rest" ? "text-muted-foreground" :
                phase === "done" ? "text-court" :
                "text-foreground"
              }
              strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={dash}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{phaseLabel}</p>
            {phase === "done" ? (
              <div className="mt-1 grid h-12 w-12 place-items-center rounded-full bg-foreground text-background">
                <Check className="h-5 w-5" />
              </div>
            ) : (
              <p className="mt-1 font-serif text-[clamp(2.6rem,5vw,3.4rem)] tabular-nums leading-none tracking-tight">
                {mm}:{ss}
              </p>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              {phase === "idle" ? `${TOTAL_SETS} sets · ${WORK_SECONDS}s work / ${REST_SECONDS}s rest`
               : phase === "done" ? "Workout complete"
               : `${WORK_SECONDS}s work · ${REST_SECONDS}s rest`}
            </p>
          </div>
        </div>

        {/* controls */}
        <div className="flex flex-1 flex-col gap-3 sm:max-w-[220px]">
          {!running ? (
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition hover:opacity-90"
            >
              <Play className="h-4 w-4" />
              {phase === "idle" ? "Start" : phase === "done" ? "Restart" : "Resume"}
            </button>
          ) : (
            <button
              onClick={onPause}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition hover:opacity-90"
            >
              <Pause className="h-4 w-4" /> Pause
            </button>
          )}
          <button
            onClick={onSkip}
            disabled={!running || phase === "done"}
            className="inline-flex items-center justify-center gap-2 rounded-full border hairline px-6 py-3 text-[13px] text-foreground/85 transition hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" /> Skip phase
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-full border hairline px-6 py-3 text-[13px] text-muted-foreground transition hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {/* set indicators */}
      <div className="mt-7 flex items-center gap-1.5">
        {Array.from({ length: TOTAL_SETS }).map((_, i) => {
          const completed = i + 1 < setIdx || phase === "done";
          const active = i + 1 === setIdx && phase !== "idle" && phase !== "done";
          return (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                completed ? "bg-foreground" : active ? "bg-foreground/60" : "bg-foreground/15"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Figure with neon motion overlay ---------- */
function FigureNeon() {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[560px]">
      {/* glow halo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-court/20 blur-[80px]" />
      </div>

      {/* figure card */}
      <div className="relative h-full w-full overflow-hidden rounded-[36px] border hairline bg-ink">
        <img
          src={heroAthlete}
          alt="Athlete in motion"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "grayscale(0.3) contrast(1.05) brightness(0.85)" }}
        />
        {/* dark vignette to feel like clean cutout */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/85" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 45%, transparent 35%, oklch(0.16 0.005 80 / 0.85) 80%)"
        }} />

        {/* neon motion lines */}
        <svg
          viewBox="0 0 100 130"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full animate-neon-pulse"
        >
          <defs>
            <linearGradient id="neon" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--court-glow)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--court-soft)" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* outer wrap curves around body */}
          <path
            d="M 18 30 C 12 55, 12 85, 22 110"
            fill="none" stroke="url(#neon)" strokeWidth="0.6" strokeLinecap="round" opacity="0.9"
          />
          <path
            d="M 82 28 C 90 55, 90 88, 78 112"
            fill="none" stroke="url(#neon)" strokeWidth="0.6" strokeLinecap="round" opacity="0.9"
          />

          {/* shoulder arc — motion sweep */}
          <path
            d="M 30 36 Q 50 22, 70 36"
            fill="none" stroke="var(--court)" strokeWidth="0.5" strokeLinecap="round" opacity="0.85"
          />
          <path
            d="M 28 40 Q 50 28, 72 40"
            fill="none" stroke="var(--court)" strokeWidth="0.3" strokeLinecap="round" opacity="0.5"
            strokeDasharray="0.6 1.2"
          />

          {/* hip swing */}
          <path
            d="M 32 70 Q 50 60, 68 70"
            fill="none" stroke="var(--court)" strokeWidth="0.45" strokeLinecap="round" opacity="0.85"
          />

          {/* legs trailing motion */}
          <path
            d="M 40 95 C 36 105, 35 115, 38 122"
            fill="none" stroke="var(--court)" strokeWidth="0.4" strokeLinecap="round" opacity="0.8"
          />
          <path
            d="M 60 95 C 64 105, 65 115, 62 122"
            fill="none" stroke="var(--court)" strokeWidth="0.4" strokeLinecap="round" opacity="0.8"
          />

          {/* horizontal motion ticks */}
          {[18, 32, 46, 60, 74].map((y, i) => (
            <line
              key={i} x1="6" y1={y} x2={i % 2 ? 14 : 11} y2={y}
              stroke="var(--court)" strokeWidth="0.3" opacity="0.6"
            />
          ))}
          {[24, 38, 52, 66, 80].map((y, i) => (
            <line
              key={i} x1={i % 2 ? 86 : 89} y1={y} x2="94" y2={y}
              stroke="var(--court)" strokeWidth="0.3" opacity="0.6"
            />
          ))}

          {/* highlight joints */}
          {[
            [50, 32], [42, 50], [58, 50], [50, 70], [44, 92], [56, 92],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.7" fill="var(--court)" />
          ))}
        </svg>

        {/* corner labels */}
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]">
          <span className="h-1.5 w-1.5 rounded-full bg-court animate-pulse-court" /> Motion ready
        </div>
        <div className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] tracking-tight text-foreground/85">
          120 BPM
        </div>
      </div>
    </div>
  );
}