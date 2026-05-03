import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { lazy, Suspense } from "react";
import { Avatar2D } from "@/components/Avatar2D";
import { clipFor, speedFor } from "@/lib/avatarClips";
import { EXERCISES, findExercise, type Exercise } from "@/lib/exerciseLibrary";
import { z } from "zod";

const Avatar3D = lazy(() => import("@/components/Avatar3D").then((m) => ({ default: m.Avatar3D })));

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/exercise")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Exercise — CourtMind Elite" },
      { name: "description", content: "Premium training session with 3D avatar guidance." },
    ],
  }),
  component: ExercisePage,
});

const PREP_SECONDS = 5;
type Phase = "idle" | "prep" | "work" | "rest" | "done";

function ExercisePage() {
  const { id } = useSearch({ from: "/exercise" });
  const [current, setCurrent] = useState<Exercise>(() => findExercise(id));

  // Timer state
  const [phase, setPhase] = useState<Phase>("idle");
  const [setIdx, setSetIdx] = useState(1);
  const [remaining, setRemaining] = useState(PREP_SECONDS);
  const [running, setRunning] = useState(false);
  const phaseRef = useRef<Phase>("idle");
  const setRef = useRef(1);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { setRef.current = setIdx; }, [setIdx]);

  // Reset when exercise changes
  useEffect(() => {
    setRunning(false); setPhase("idle"); setSetIdx(1); setRemaining(PREP_SECONDS);
  }, [current.id]);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        const p = phaseRef.current;
        if (p === "prep") { setPhase("work"); return current.workSec; }
        if (p === "work") {
          if (setRef.current >= current.sets) { setPhase("done"); setRunning(false); return 0; }
          setPhase("rest"); return current.restSec;
        }
        if (p === "rest") { setSetIdx((s) => s + 1); setPhase("work"); return current.workSec; }
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [running, current.workSec, current.restSec, current.sets]);

  const start = () => {
    if (phase === "idle" || phase === "done") {
      setSetIdx(1); setPhase("prep"); setRemaining(PREP_SECONDS);
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setPhase("idle"); setSetIdx(1); setRemaining(PREP_SECONDS); };
  const skip = () => setRemaining(1);

  const totalForPhase =
    phase === "prep" ? PREP_SECONDS :
    phase === "work" ? current.workSec :
    phase === "rest" ? current.restSec : PREP_SECONDS;
  const isActive = phase !== "idle" && phase !== "done";
  const progress = isActive ? 1 - remaining / totalForPhase : phase === "done" ? 1 : 0;

  const phaseLabel =
    phase === "idle" ? "Ready" :
    phase === "prep" ? "Get ready" :
    phase === "work" ? "Work" :
    phase === "rest" ? "Rest" : "Complete";

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  // Ring math
  const size = 220;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - progress);

  const avatarPaused = !running || phase === "rest" || phase === "idle" || phase === "done";

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased">
      <header className="relative z-20">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/training" className="text-[13px] text-muted-foreground transition hover:text-foreground">
            ← Back
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">
            {current.sportTag} · {current.type}
          </p>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto grid max-w-[1100px] gap-8 px-5 pb-24 pt-2 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        {/* LEFT: Avatar + Timer */}
        <section>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Now playing
          </p>
          <h1 className="mt-3 text-balance text-[clamp(2rem,5vw,3.2rem)] font-medium leading-[1] tracking-[-0.03em]">
            {current.name}.
          </h1>

          {/* 3D avatar stage */}
          <div className="mt-6 overflow-hidden rounded-3xl border hairline" style={{ aspectRatio: "4/5", background: "#F5F5F5" }}>
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Avatar2D /></div>}>
              <Avatar3D
                key={current.id}
                clipUrl={clipFor(current.movement)}
                speed={speedFor(current.movement)}
                paused={avatarPaused}
                className="h-full w-full"
              />
            </Suspense>
          </div>

          {/* Timer + controls */}
          <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-foreground/10" strokeWidth={stroke} />
                <circle
                  cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
                  className={phase === "rest" ? "text-muted-foreground" : "text-foreground"}
                  strokeWidth={stroke} strokeLinecap="round"
                  strokeDasharray={c} strokeDashoffset={dash}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{phaseLabel}</p>
                <p className="mt-2 font-serif text-[clamp(2.4rem,4.5vw,3.2rem)] tabular-nums leading-none tracking-tight">
                  {phase === "done" ? "00:00" : `${mm}:${ss}`}
                </p>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Set {Math.min(setIdx, current.sets)} / {current.sets}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-1 flex-col gap-3 sm:max-w-[240px]">
              {!running ? (
                <button onClick={start} className="rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition hover:opacity-90">
                  {phase === "idle" ? "Start" : phase === "done" ? "Restart" : "Resume"}
                </button>
              ) : (
                <button onClick={pause} className="rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition hover:opacity-90">
                  Pause
                </button>
              )}
              <button
                onClick={skip}
                disabled={!running || phase === "done"}
                className="rounded-full border hairline px-6 py-3 text-[13px] text-foreground/85 transition hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
              >
                Skip phase
              </button>
              <button onClick={reset} className="rounded-full border hairline px-6 py-3 text-[13px] text-muted-foreground transition hover:text-foreground">
                Reset
              </button>
            </div>
          </div>

          {/* set indicators */}
          <div className="mt-6 flex items-center gap-1.5">
            {Array.from({ length: current.sets }).map((_, i) => {
              const completed = i + 1 < setIdx || phase === "done";
              const active = i + 1 === setIdx && phase !== "idle" && phase !== "done";
              return (
                <span key={i} className={`h-1 flex-1 rounded-full ${completed ? "bg-foreground" : active ? "bg-foreground/60" : "bg-foreground/15"}`} />
              );
            })}
          </div>
        </section>

        {/* RIGHT: Exercise selector */}
        <aside>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Exercises</p>
          <ul className="mt-4 divide-y hairline border-y hairline">
            {EXERCISES.map((ex) => {
              const active = ex.id === current.id;
              return (
                <li key={ex.id}>
                  <button
                    onClick={() => setCurrent(ex)}
                    className={`group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-4 text-left transition ${
                      active ? "opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-foreground" : "bg-foreground/25"}`} />
                    <span>
                      <span className="block text-[14px] font-medium tracking-tight">{ex.name}</span>
                      <span className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {ex.type} · {ex.sportTag}
                      </span>
                    </span>
                    <span className="text-[12px] tabular-nums text-muted-foreground">
                      {ex.sets}×{ex.workSec}s
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </main>
    </div>
  );
}