import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Upload, Video, Image as ImageIcon, PenLine, ArrowLeft, Play, Pause,
  Sparkles, Check, Lock, ChevronRight, Activity, Target, Gauge, Zap,
  CheckCircle2, AlertTriangle, XCircle, Lightbulb,
} from "lucide-react";
import heroAthlete from "@/assets/hero-athlete.jpg";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze — CourtMind Elite" },
      { name: "description", content: "Send a training video and receive precise AI feedback." },
    ],
  }),
  component: AnalyzePage,
});

type Phase = "upload" | "analyzing" | "result";

function AnalyzePage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const statuses = [
    "Uploading video…",
    "Detecting skeleton…",
    "Mapping joints and angles…",
    "Analyzing rhythm and balance…",
    "Composing your feedback…",
  ];

  useEffect(() => {
    if (phase !== "analyzing") return;
    setProgress(0);
    setStatusIdx(0);
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => setPhase("result"), 400);
          return 100;
        }
        setStatusIdx(Math.min(statuses.length - 1, Math.floor(next / 20)));
        return next;
      });
    }, 80);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      {/* top bar */}
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/home" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">Analysis</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-32 pt-10 sm:px-8 sm:pt-16">
        {phase === "upload" && <UploadView onStart={() => setPhase("analyzing")} />}
        {phase === "analyzing" && (
          <AnalyzingView progress={progress} status={statuses[statusIdx]} />
        )}
        {phase === "result" && <ResultView onReset={() => setPhase("upload")} />}
      </main>
    </div>
  );
}

/* ============== UPLOAD ============== */
function UploadView({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-float-up">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Step 01</p>
      <h1 className="mt-5 text-balance text-[clamp(2.2rem,6vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
        Send your <span className="font-serif italic font-normal text-court-gradient">training.</span>
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        Record a short clip, upload from your gallery, or describe the session. The AI will read movement, balance and rhythm with quiet precision.
      </p>

      {/* Big primary action */}
      <button
        onClick={onStart}
        className="group relative mt-12 block w-full overflow-hidden rounded-3xl border hairline bg-card p-10 text-left transition hover:glow-court sm:p-14"
      >
        <div className="absolute inset-0 opacity-30 transition group-hover:opacity-50">
          <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-court/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-court text-ink glow-court animate-pulse-court">
              <Upload className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[12px] uppercase tracking-[0.24em] text-court">Upload</p>
              <p className="mt-1 text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-tight tracking-tight">
                Send training video
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">MP4, MOV · up to 2 minutes</p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-court transition group-hover:translate-x-1" />
        </div>
      </button>

      {/* Three options */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <OptionCard
          icon={<Video className="h-5 w-5" />}
          title="Record video"
          desc="Capture from camera"
          onClick={onStart}
        />
        <OptionCard
          icon={<ImageIcon className="h-5 w-5" />}
          title="From gallery"
          desc="Pick an existing clip"
          onClick={onStart}
        />
        <OptionCard
          icon={<PenLine className="h-5 w-5" />}
          title="Write training"
          desc="Describe the session"
          onClick={onStart}
        />
      </div>

      {/* Tips */}
      <div className="mt-12 rounded-2xl border hairline glass p-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">For best precision</p>
        <ul className="mt-4 grid gap-3 text-[14px] text-foreground/85 sm:grid-cols-2">
          <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-court" /> Keep the full body in frame</li>
          <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-court" /> Side angle, stable camera</li>
          <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-court" /> Good, even lighting</li>
          <li className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 text-court" /> 15–60 seconds is ideal</li>
        </ul>
      </div>
    </div>
  );
}

function OptionCard({
  icon, title, desc, onClick,
}: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border hairline bg-card p-5 text-left transition hover:border-court/40 hover:glow-court-soft"
    >
      <span className="grid h-11 w-11 place-items-center rounded-full border hairline text-court transition group-hover:bg-court group-hover:text-ink group-hover:border-court">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-[14px] font-medium">{title}</p>
        <p className="text-[12px] text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-court" />
    </button>
  );
}

/* ============== ANALYZING ============== */
function AnalyzingView({ progress, status }: { progress: number; status: string }) {
  return (
    <div className="mx-auto max-w-2xl py-10 text-center animate-fade-in">
      <div className="relative mx-auto h-32 w-32">
        <div className="absolute inset-0 rounded-full court-gradient opacity-20 blur-2xl" />
        <svg viewBox="0 0 100 100" className="relative h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground/10" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke="var(--court)" strokeWidth="2" strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * 276.46} 276.46`}
            style={{ filter: "drop-shadow(0 0 8px var(--court))" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-3xl font-medium tracking-tight">{progress}<span className="text-[14px] text-muted-foreground">%</span></span>
        </div>
      </div>

      <p className="mt-10 text-[11px] uppercase tracking-[0.24em] text-court">AI Analysis</p>
      <h2 className="mt-3 text-balance text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-tight tracking-tight">
        {status}
      </h2>
      <p className="mt-4 text-[14px] text-muted-foreground">This usually takes under a minute.</p>
    </div>
  );
}

/* ============== RESULT ============== */
function ResultView({ onReset }: { onReset: () => void }) {
  const [playing, setPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="animate-float-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Analysis complete</p>
          <h1 className="mt-3 text-balance text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Your form, <span className="font-serif italic font-normal text-court-gradient">decoded.</span>
          </h1>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 text-[12px] text-muted-foreground transition hover:text-foreground hover:border-court/40"
        >
          New analysis
        </button>
      </div>

      {/* Video + overlay */}
      <div ref={containerRef} className="relative mt-10 overflow-hidden rounded-3xl border hairline bg-card">
        <div className="relative aspect-video">
          <img src={heroAthlete} alt="Training analysis" className="absolute inset-0 h-full w-full object-cover" />
          {/* overlay marks */}
          <PoseOverlay />
          {/* HUD */}
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-court animate-pulse-court" /> Pose tracking
          </div>
          <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-[11px] text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-court" /> AI overlay
          </div>

          {/* timeline */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-background to-transparent p-5">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="grid h-10 w-10 place-items-center rounded-full bg-court text-ink glow-court-soft"
            >
              {playing ? <Pause className="h-4 w-4 fill-ink" /> : <Play className="h-4 w-4 fill-ink" />}
            </button>
            <div className="flex-1">
              <div className="relative h-1 rounded-full bg-foreground/15">
                <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-court glow-court-soft" />
                <span className="absolute -top-1 left-2/3 h-3 w-3 -translate-x-1/2 rounded-full bg-court ring-2 ring-background" />
              </div>
            </div>
            <p className="text-[12px] tabular-nums text-foreground/80">0:24 / 0:36</p>
          </div>
        </div>
      </div>

      {/* Score row */}
      <section className="mt-10 grid gap-px bg-foreground/10 sm:grid-cols-4 rounded-2xl overflow-hidden border hairline">
        <Metric icon={<Gauge className="h-4 w-4" />} label="Overall" value="82" unit="/100" />
        <Metric icon={<Activity className="h-4 w-4" />} label="Posture" value="88" unit="/100" />
        <Metric icon={<Target className="h-4 w-4" />} label="Precision" value="74" unit="/100" />
        <Metric icon={<Zap className="h-4 w-4" />} label="Tempo" value="79" unit="/100" />
      </section>

      {/* Overall score with animated bar */}
      <OverallScore score={8.7} />

      {/* Feedback by severity + locked premium */}
      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <FeedbackBlock
            tone="success"
            title="Strengths"
            items={[
              { t: "Elbow path consistent", d: "Clean line through the swing — keep this base." },
              { t: "Stable shoulder line", d: "Excellent kinetic chain on contact." },
              { t: "Foot recovery balanced", d: "Center of mass holds well between shots." },
            ]}
          />
          <FeedbackBlock
            tone="warn"
            title="To improve"
            items={[
              { t: "Recovery step short", d: "Add one extra split-step before the next shot." },
              { t: "Knee alignment drifts", d: "Right knee tracks slightly inward on landing." },
            ]}
          />
          <FeedbackBlock
            tone="danger"
            title="Critical errors"
            items={[
              { t: "Hip rotation opens early", d: "Loses ~12% power on contact. Delay rotation by ~120 ms." },
            ]}
          />
        </div>

        {/* Locked deep analysis */}
        <div className="relative overflow-hidden rounded-2xl border hairline bg-card p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 select-none p-7 text-[13px] leading-relaxed text-foreground/70"
            style={{ filter: "blur(6px)" }}
          >
            Frame 142 — left knee flexion exceeds optimal by 12°. Hip-shoulder
            separation drops to 28° before contact, reducing kinetic chain
            output. Recommended drill: medicine ball rotational throws, 3×8 each
            side, with a 2-second hold at peak rotation. Frame 198 — racquet
            head speed measured at 41.2 m/s, 6% below your 30-day baseline.
          </div>

          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.24em] text-court">Premium</p>
            <h3 className="mt-3 text-2xl font-medium tracking-tight">Deep biomechanics</h3>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Frame-by-frame angles, kinetic chain efficiency, and a tailored 7-day plan.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-court px-5 py-3 text-[13px] font-medium text-ink transition hover:opacity-90 glow-court">
              <Lock className="h-3.5 w-3.5" /> Unlock full analysis
            </button>
          </div>
        </div>
      </section>

      {/* AI suggestions */}
      <AiSuggestions />

      {/* Suggested drills */}
      <section className="mt-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Suggested drills</p>
        <ul className="mt-5 divide-y hairline border-y hairline">
          {[
            { t: "Rotational med-ball throws", d: "3 × 8 each side · 2s hold", m: "Power" },
            { t: "Split-step ladder", d: "4 × 30s · 30s rest", m: "Footwork" },
            { t: "Shadow swings · slow-mo", d: "5 min · focus on hip delay", m: "Form" },
          ].map((d) => (
            <li key={d.t} className="grid grid-cols-12 items-center gap-4 py-5">
              <span className="col-span-1 font-serif text-lg italic text-muted-foreground">·</span>
              <div className="col-span-7">
                <p className="text-[15px] font-medium">{d.t}</p>
                <p className="text-[13px] text-muted-foreground">{d.d}</p>
              </div>
              <p className="col-span-3 text-right text-[12px] uppercase tracking-[0.2em] text-court">{d.m}</p>
              <ChevronRight className="col-span-1 ml-auto h-4 w-4 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Metric({
  icon, label, value, unit,
}: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="bg-background p-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
        <span className="text-court">{icon}</span>
      </div>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-medium tracking-tight">{value}</span>
        <span className="text-[12px] text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

/* ---------- SVG Pose Overlay ---------- */
function PoseOverlay() {
  // Simulated joints (percentages of container)
  const joints = {
    head: [50, 18],
    neck: [50, 26],
    lShoulder: [44, 30], rShoulder: [56, 30],
    lElbow: [38, 42], rElbow: [62, 42],
    lHand: [33, 54], rHand: [67, 52],
    hip: [50, 52],
    lHipJ: [46, 53], rHipJ: [54, 53],
    lKnee: [44, 70], rKnee: [56, 70],
    lFoot: [42, 88], rFoot: [58, 88],
  } as const;

  const lines: [keyof typeof joints, keyof typeof joints][] = [
    ["head", "neck"],
    ["neck", "lShoulder"], ["neck", "rShoulder"],
    ["lShoulder", "lElbow"], ["lElbow", "lHand"],
    ["rShoulder", "rElbow"], ["rElbow", "rHand"],
    ["neck", "hip"],
    ["hip", "lHipJ"], ["hip", "rHipJ"],
    ["lHipJ", "lKnee"], ["lKnee", "lFoot"],
    ["rHipJ", "rKnee"], ["rKnee", "rFoot"],
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ filter: "drop-shadow(0 0 4px var(--court))" }}
    >
      {lines.map(([a, b], i) => {
        const [ax, ay] = joints[a];
        const [bx, by] = joints[b];
        return (
          <line
            key={i}
            x1={ax} y1={ay} x2={bx} y2={by}
            stroke="var(--court)" strokeWidth="0.4" strokeLinecap="round"
            opacity="0.9"
          />
        );
      })}
      {Object.entries(joints).map(([k, [x, y]]) => (
        <circle key={k} cx={x} cy={y} r="0.7" fill="var(--court)" />
      ))}
      {/* Angle indicator at right elbow */}
      <g>
        <path
          d="M 62 42 A 4 4 0 0 1 67 45"
          fill="none" stroke="var(--court)" strokeWidth="0.3" opacity="0.8"
        />
        <text x="68.5" y="45" fontSize="2.2" fill="var(--court)" fontFamily="Inter, sans-serif">
          112°
        </text>
      </g>
      {/* Hip rotation marker */}
      <g>
        <circle cx="50" cy="52" r="2.5" fill="none" stroke="var(--court)" strokeWidth="0.25" strokeDasharray="0.6 0.6" />
        <text x="54" y="52.8" fontSize="2" fill="var(--court)" fontFamily="Inter, sans-serif">
          hip · early
        </text>
      </g>
    </svg>
  );
}

/* ---------- Overall score with animated bar ---------- */
function OverallScore({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  return (
    <section className="mt-10 overflow-hidden rounded-2xl border hairline bg-card p-7">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-court">Overall score</p>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="text-[clamp(3rem,7vw,5.5rem)] font-medium leading-none tracking-[-0.04em] text-court-gradient">
              {score.toFixed(1)}
            </span>
            <span className="text-[18px] text-muted-foreground">/ 10</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Verdict</p>
          <p className="mt-2 text-[15px] font-medium">Strong session — refine the details.</p>
        </div>
      </div>
      <div className="mt-7">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-court glow-court-soft animate-score-fill"
            style={{ ["--score-w" as string]: `${pct}%`, width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
          <span>0</span><span>5</span><span>10</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Feedback block (success / warn / danger) ---------- */
type Tone = "success" | "warn" | "danger";
function FeedbackBlock({
  tone, title, items,
}: { tone: Tone; title: string; items: { t: string; d: string }[] }) {
  const cfg = {
    success: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: "Strengths",
      ring: "border-l-2 border-l-success",
      tint: "text-success",
      tagBg: "bg-success/10",
      glow: "",
    },
    warn: {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "To improve",
      ring: "border-l-2 border-l-warn",
      tint: "text-warn",
      tagBg: "bg-warn/10",
      glow: "glow-warn",
    },
    danger: {
      icon: <XCircle className="h-4 w-4" />,
      label: "Critical",
      ring: "border-l-2 border-l-danger",
      tint: "text-danger",
      tagBg: "bg-danger/10",
      glow: "glow-danger",
    },
  }[tone];

  return (
    <div className={`rounded-2xl border hairline bg-card p-6 ${cfg.ring}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-8 w-8 place-items-center rounded-full ${cfg.tagBg} ${cfg.tint} ${cfg.glow}`}>
          {cfg.icon}
        </span>
        <p className={`text-[11px] uppercase tracking-[0.24em] ${cfg.tint}`}>{title}</p>
      </div>
      <ul className="mt-4 divide-y hairline">
        {items.map((it) => (
          <li key={it.t} className="flex items-start gap-3 py-3">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.tint.replace("text-", "bg-")}`} />
            <div>
              <p className="text-[14px] font-medium">{it.t}</p>
              <p className="text-[13px] text-muted-foreground">{it.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- AI suggestions ---------- */
function AiSuggestions() {
  const tips = [
    "Adjust your right knee — keep it tracking over the second toe on landing.",
    "Improve upper-body posture: chin tucked, eyes level, shoulders relaxed.",
    "Hold hip rotation 120 ms longer before contact for cleaner power transfer.",
    "Soften the grip during recovery — your forearm tension spikes between shots.",
  ];
  return (
    <section className="mt-10 overflow-hidden rounded-2xl border hairline bg-card p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-court/15 text-court glow-court-soft">
          <Lightbulb className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-court">AI suggestions</p>
          <p className="text-[14px] text-muted-foreground">Refinements composed for your next session.</p>
        </div>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {tips.map((t, i) => (
          <li
            key={i}
            className="group flex items-start gap-3 rounded-xl border hairline bg-background/40 p-4 transition hover:border-court/40 hover:bg-card"
          >
            <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-court text-ink text-[10px] font-medium">
              {i + 1}
            </span>
            <p className="text-[14px] leading-relaxed text-foreground/90">{t}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}