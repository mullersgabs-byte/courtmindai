import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/exercise")({
  head: () => ({
    meta: [
      { title: "Exercise — CourtMind Elite" },
      { name: "description", content: "Run a focused training session with timed sets." },
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
  const [setIdx, setSetIdx] = useState(1);
  const [remaining, setRemaining] = useState(PREP_SECONDS);
  const [running, setRunning] = useState(false);
  const phaseRef = useRef<Phase>("idle");
  const setRef = useRef(1);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { setRef.current = setIdx; }, [setIdx]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        const p = phaseRef.current;
        if (p === "prep") { setPhase("work"); return WORK_SECONDS; }
        if (p === "work") {
          if (setRef.current >= TOTAL_SETS) {
            setPhase("done"); setRunning(false); return 0;
          }
          setPhase("rest"); return REST_SECONDS;
        }
        if (p === "rest") { setSetIdx((s) => s + 1); setPhase("work"); return WORK_SECONDS; }
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const start = () => {
    if (phase === "idle" || phase === "done") {
      setSetIdx(1); setPhase("prep"); setRemaining(PREP_SECONDS);
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false); setPhase("idle"); setSetIdx(1); setRemaining(PREP_SECONDS);
  };
  const skip = () => setRemaining(1);

  const isActive = phase !== "idle" && phase !== "done";
  const totalForPhase =
    phase === "prep" ? PREP_SECONDS :
    phase === "work" ? WORK_SECONDS :
    phase === "rest" ? REST_SECONDS : PREP_SECONDS;
  const progress = isActive ? 1 - remaining / totalForPhase : phase === "done" ? 1 : 0;

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased">
      {/* top bar */}
      <header className="relative z-20">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/home"
            className="text-[13px] text-muted-foreground transition hover:text-foreground"
          >
            ← Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">
            Exercise · 03 of 12
          </p>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 pb-24 pt-6 sm:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Footwork · Tennis
        </p>
        <h1 className="mt-5 text-balance text-[clamp(2.6rem,7vw,4.4rem)] font-medium leading-[0.95] tracking-[-0.04em]">
          Lateral split-step.
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Quick lateral hops with a controlled landing. Keeps the body loaded
          and ready for the next shot.
        </p>

        {/* meta row */}
        <ul className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border hairline bg-foreground/10">
          <Meta label="Duration" value={`${TOTAL_SETS} × ${WORK_SECONDS}s`} />
          <Meta label="Intensity" value="High" />
          <Meta label="Focus" value="Reaction" />
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
        <ol className="mt-12 divide-y hairline border-y hairline">
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
      </main>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <li className="bg-background p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-[15px] font-medium tracking-tight">{value}</p>
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

  const size = 240;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - progress);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const primaryLabel =
    phase === "idle" ? "Start" :
    phase === "done" ? "Restart" : "Resume";

  return (
    <section className="mt-12 overflow-hidden rounded-3xl border hairline bg-card p-7 sm:p-9">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Execution</p>
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Set {Math.min(setIdx, TOTAL_SETS)} / {TOTAL_SETS}
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
        {/* ring */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
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
                phase === "rest" ? "text-muted-foreground" : "text-foreground"
              }
              strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={dash}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {phaseLabel}
            </p>
            <p className="mt-2 font-serif text-[clamp(2.8rem,5vw,3.6rem)] tabular-nums leading-none tracking-tight">
              {phase === "done" ? "00:00" : `${mm}:${ss}`}
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {phase === "done" ? "Workout complete" : `${WORK_SECONDS}s work · ${REST_SECONDS}s rest`}
            </p>
          </div>
        </div>

        {/* controls */}
        <div className="flex w-full flex-1 flex-col gap-3 sm:max-w-[240px]">
          {!running ? (
            <button
              onClick={onStart}
              className="rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition hover:opacity-90"
            >
              {primaryLabel}
            </button>
          ) : (
            <button
              onClick={onPause}
              className="rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition hover:opacity-90"
            >
              Pause
            </button>
          )}
          <button
            onClick={onSkip}
            disabled={!running || phase === "done"}
            className="rounded-full border hairline px-6 py-3 text-[13px] text-foreground/85 transition hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
          >
            Skip phase
          </button>
          <button
            onClick={onReset}
            className="rounded-full border hairline px-6 py-3 text-[13px] text-muted-foreground transition hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </div>

      {/* set indicators */}
      <div className="mt-8 flex items-center gap-1.5">
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
    </section>
  );
}
