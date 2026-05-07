import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Pause, Play, Square, Camera, Repeat } from "lucide-react";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Record — Traino" }] }),
  component: TrainingPage,
});

type Phase = "intro" | "permission" | "ready" | "recording" | "paused" | "done";

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const r = (s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
}

function TrainingPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [seconds, setSeconds] = useState(0);
  const [reps, setReps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const requestCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setPhase("ready");
    } catch {
      setError("Camera access was denied. Allow camera in your browser to record.");
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("done");
  };

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header onBack={() => navigate({ to: "/home" })} />
        <main className="mx-auto max-w-[440px] px-6 pt-10">
          <p className="text-[12px] uppercase tracking-[0.24em] text-white/45">Record workout</p>
          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em]">Frame yourself, then start.</h1>
          <p className="mt-3 text-[14px] text-white/55">Traino analyzes posture, balance and execution in real time. Nothing leaves your device until you save.</p>

          <ul className="mt-8 space-y-3 text-[14px]">
            {["Place your phone vertically", "Step back so your full body is visible", "Good lighting helps detection"].map((s, i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[11px] font-medium">{i + 1}</span>
                <span className="text-white/80">{s}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setPhase("permission")}
            className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-[15px] font-semibold text-black"
          >
            <Camera size={16} /> Continue
          </button>
        </main>
      </div>
    );
  }

  if (phase === "permission") {
    return (
      <div className="grid min-h-screen place-items-center bg-black px-6 text-white">
        <div className="w-full max-w-[400px] text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/[0.04]">
            <Camera size={22} />
          </div>
          <h1 className="mt-6 text-[22px] font-semibold tracking-tight">Allow camera access</h1>
          <p className="mt-2 text-[14px] text-white/55">Required to analyze your movement in real time.</p>
          {error && <p className="mt-4 text-[13px] text-white/70">{error}</p>}
          <button onClick={requestCamera} className="mt-8 w-full rounded-full bg-white px-6 py-3.5 text-[14px] font-semibold text-black">Enable camera</button>
          <button onClick={() => navigate({ to: "/home" })} className="mt-3 w-full rounded-full border border-white/10 px-6 py-3.5 text-[14px] text-white/70">Cancel</button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return <PostWorkout seconds={seconds} reps={reps} onBack={() => navigate({ to: "/home" })} />;
  }

  // ready / recording / paused — camera UI
  const recording = phase === "recording";
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/15 to-black/85" />

      {/* Top */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12">
        <button onClick={stop} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-black/60 backdrop-blur-md">
          <ChevronLeft size={16} />
        </button>
        <div className="rounded-full border border-white/15 bg-black/55 px-3 py-1.5 backdrop-blur-md">
          <p className="flex items-center gap-2 text-[12px] font-medium tracking-wide">
            <span className={`h-2 w-2 rounded-full ${recording ? "bg-white animate-pulse" : "bg-white/40"}`} />
            {recording ? "Recording" : phase === "paused" ? "Paused" : "Ready"}
          </p>
        </div>
        <div className="w-9" />
      </div>

      {/* Title */}
      <div className="relative z-10 mx-auto mt-6 max-w-[440px] px-5 text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">Squat session</p>
        <h2 className="mt-1 text-[20px] font-semibold tracking-tight">Hold form. Breathe.</h2>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-10">
        <div className="mx-auto max-w-[440px] rounded-3xl border border-white/10 bg-black/60 p-5 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <Metric label="Time" value={fmt(seconds)} />
            <Metric label="Reps" value={String(reps)} />
            <button onClick={() => setReps((r) => r + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.06]" aria-label="Add rep">
              <Repeat size={15} />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button onClick={stop} className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.06]" aria-label="Stop">
              <Square size={16} />
            </button>
            {recording ? (
              <button onClick={() => setPhase("paused")} className="grid h-16 w-16 place-items-center rounded-full bg-white text-black" aria-label="Pause">
                <Pause size={22} />
              </button>
            ) : (
              <button onClick={() => setPhase("recording")} className="grid h-16 w-16 place-items-center rounded-full bg-white text-black" aria-label="Start">
                <Play size={22} />
              </button>
            )}
            <div className="h-12 w-12" />
          </div>

          {recording && (
            <p className="mt-4 text-center text-[12px] text-white/65">AI: knees stable, chest upright. Maintain depth.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[440px] items-center justify-between px-5 py-4">
        <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04]"><ChevronLeft size={16} /></button>
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Session</p>
        <div className="w-9" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[24px] font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</p>
    </div>
  );
}

function PostWorkout({ seconds, reps, onBack }: { seconds: number; reps: number; onBack: () => void }) {
  const overall = 87;
  const posture = 91;
  const balance = 84;
  const execution = 86;
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Header onBack={onBack} />
      <main className="mx-auto max-w-[440px] px-5 pt-8">
        <p className="text-[12px] uppercase tracking-[0.24em] text-white/45">Analysis complete</p>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em]">Session summary</h1>
        <p className="mt-2 text-[14px] text-white/55">{fmt(seconds)} · {reps} reps</p>

        <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Overall score</p>
          <p className="mt-3 text-[64px] font-semibold leading-none tracking-tight">{overall}</p>
          <p className="mt-2 text-[12px] text-white/55">+6% vs. last session</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Score k="Posture" v={posture} />
          <Score k="Balance" v={balance} />
          <Score k="Execution" v={execution} />
        </div>

        <Section title="Mistakes">
          <Bullet>Knees collapse inward during the second half of the set.</Bullet>
          <Bullet>Shoulders lean too far forward at the bottom of the squat.</Bullet>
        </Section>

        <Section title="Strengths">
          <Bullet>Posture improves consistently after rep 4.</Bullet>
          <Bullet>Tempo stays controlled across all sets.</Bullet>
        </Section>

        <Section title="Recommendations">
          <Bullet>Add 2 sets of banded squats to reinforce knee tracking.</Bullet>
          <Bullet>Mobilize the thoracic spine before your next session.</Bullet>
        </Section>

        <button onClick={onBack} className="mt-8 w-full rounded-full bg-white px-6 py-4 text-[15px] font-semibold text-black">Back to feed</button>
      </main>
    </div>
  );
}

function Score({ k, v }: { k: string; v: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center">
      <p className="text-[24px] font-semibold tracking-tight">{v}</p>
      <div className="mx-auto mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-white" style={{ width: `${v}%` }} />
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/45">{k}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <p className="px-1 text-[11px] uppercase tracking-[0.22em] text-white/45">{title}</p>
      <ul className="mt-2 space-y-1.5">{children}</ul>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[13.5px] leading-relaxed text-white/85">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/55" />
      <span>{children}</span>
    </li>
  );
}
