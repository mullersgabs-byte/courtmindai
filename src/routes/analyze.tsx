import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Upload, Video, Image as ImageIcon, PenLine, ArrowLeft, Play, Pause,
  Sparkles, Check, Lock, ChevronRight, Activity, Target, Gauge, Zap,
  CheckCircle2, AlertTriangle, XCircle, Lightbulb,
} from "lucide-react";
import heroAthlete from "@/assets/hero-athlete.jpg";

// Public sample MP4 used for the analysis playback demo.
const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBigBuckBunny.mp4";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);          // currentTime in seconds
  const [duration, setDuration] = useState(0);

  // Sync UI <-> <video>
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setT(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    // try autoplay (muted is required by most browsers)
    v.muted = true;
    v.play().catch(() => {});
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  };

  const progress = duration ? t / duration : 0;

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
      <div className="relative mt-10 overflow-hidden rounded-3xl border hairline bg-card">
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            src={SAMPLE_VIDEO}
            poster={heroAthlete}
            playsInline
            loop
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* live overlay marks driven by video time */}
          <PoseOverlay time={t} duration={duration || 1} />
          {/* HUD */}
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-court animate-pulse-court" /> Pose tracking
          </div>
          <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-court" /> AI overlay · live
          </div>
          {/* live cue caption (top-center) */}
          <LiveCue time={t} />

          {/* timeline */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-background to-transparent p-5">
            <button
              onClick={togglePlay}
              className="grid h-10 w-10 place-items-center rounded-full bg-court text-ink glow-court-soft"
            >
              {playing ? <Pause className="h-4 w-4 fill-ink" /> : <Play className="h-4 w-4 fill-ink" />}
            </button>
            <div className="flex-1">
              <div
                onClick={seek}
                className="relative h-2 cursor-pointer rounded-full bg-foreground/15"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-court glow-court-soft"
                  style={{ width: `${progress * 100}%` }}
                />
                {/* event markers on timeline */}
                {EVENT_MARKERS.map((m) => (
                  <span
                    key={m.at}
                    title={m.label}
                    className={`absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 ${
                      m.tone === "danger" ? "bg-danger"
                      : m.tone === "warn"  ? "bg-warn"
                      :                      "bg-success"
                    }`}
                    style={{ left: `${m.at * 100}%`, opacity: 0.9 }}
                  />
                ))}
                <span
                  className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full bg-court ring-2 ring-background"
                  style={{ left: `${progress * 100}%` }}
                />
              </div>
            </div>
            <p className="text-[12px] tabular-nums text-foreground/80">
              {fmt(t)} / {fmt(duration)}
            </p>
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

/* ---------- helpers ---------- */
function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

// Normalised timeline events (0..1 of duration) — drive markers + cues
type EventTone = "success" | "warn" | "danger";
const EVENT_MARKERS: { at: number; tone: EventTone; label: string }[] = [
  { at: 0.18, tone: "success", label: "Stable shoulder line" },
  { at: 0.36, tone: "warn",    label: "Knee tracks inward" },
  { at: 0.55, tone: "danger",  label: "Hip rotation opens early" },
  { at: 0.74, tone: "success", label: "Balanced foot recovery" },
  { at: 0.9,  tone: "warn",    label: "Recovery step short" },
];

function LiveCue({ time }: { time: number }) {
  // Find the most recent event within a 1.2s window
  const cue = (() => {
    const all = EVENT_MARKERS.map((m) => ({ ...m, abs: m.at })); // resolved later
    return all;
  })();
  // We need duration to map; LiveCue receives time only — derive from PoseOverlay context via window flag
  // Simpler: render the cue inside PoseOverlay since it has duration.
  void cue;
  return null;
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
/* ---------- SVG Pose Overlay (live, time-driven) ---------- */
type Joints = {
  head: [number, number]; neck: [number, number];
  lShoulder: [number, number]; rShoulder: [number, number];
  lElbow: [number, number]; rElbow: [number, number];
  lHand: [number, number]; rHand: [number, number];
  hip: [number, number];
  lHipJ: [number, number]; rHipJ: [number, number];
  lKnee: [number, number]; rKnee: [number, number];
  lFoot: [number, number]; rFoot: [number, number];
};

// Two keyposes that we cycle through with a sinusoidal interpolation,
// so the skeleton subtly moves with the playback.
const POSE_A: Joints = {
  head: [50, 18], neck: [50, 26],
  lShoulder: [44, 30], rShoulder: [56, 30],
  lElbow: [38, 42], rElbow: [62, 42],
  lHand: [33, 54], rHand: [67, 52],
  hip: [50, 52],
  lHipJ: [46, 53], rHipJ: [54, 53],
  lKnee: [44, 70], rKnee: [56, 70],
  lFoot: [42, 88], rFoot: [58, 88],
};
const POSE_B: Joints = {
  head: [52, 19], neck: [52, 27],
  lShoulder: [46, 31], rShoulder: [58, 31],
  lElbow: [40, 44], rElbow: [66, 40],
  lHand: [36, 56], rHand: [72, 47],
  hip: [52, 53],
  lHipJ: [48, 54], rHipJ: [56, 54],
  lKnee: [45, 71], rKnee: [60, 69],
  lFoot: [43, 89], rFoot: [62, 88],
};

const LINES: [keyof Joints, keyof Joints][] = [
  ["head", "neck"],
  ["neck", "lShoulder"], ["neck", "rShoulder"],
  ["lShoulder", "lElbow"], ["lElbow", "lHand"],
  ["rShoulder", "rElbow"], ["rElbow", "rHand"],
  ["neck", "hip"],
  ["hip", "lHipJ"], ["hip", "rHipJ"],
  ["lHipJ", "lKnee"], ["lKnee", "lFoot"],
  ["rHipJ", "rKnee"], ["rKnee", "rFoot"],
];

function lerp(a: number, b: number, k: number) { return a + (b - a) * k; }
function lerpPt(a: [number, number], b: [number, number], k: number): [number, number] {
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
}

function angleAt(p: [number, number], q: [number, number], r: [number, number]) {
  const v1 = [p[0] - q[0], p[1] - q[1]];
  const v2 = [r[0] - q[0], r[1] - q[1]];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const m1 = Math.hypot(v1[0], v1[1]);
  const m2 = Math.hypot(v2[0], v2[1]);
  const c = Math.max(-1, Math.min(1, dot / (m1 * m2 || 1)));
  return Math.round((Math.acos(c) * 180) / Math.PI);
}

function PoseOverlay({ time, duration }: { time: number; duration: number }) {
  // 0..1 oscillation between the two keyposes
  const k = 0.5 - 0.5 * Math.cos((time % 2) * Math.PI); // ~2s cycle

  const joints: Joints = {
    head: lerpPt(POSE_A.head, POSE_B.head, k),
    neck: lerpPt(POSE_A.neck, POSE_B.neck, k),
    lShoulder: lerpPt(POSE_A.lShoulder, POSE_B.lShoulder, k),
    rShoulder: lerpPt(POSE_A.rShoulder, POSE_B.rShoulder, k),
    lElbow: lerpPt(POSE_A.lElbow, POSE_B.lElbow, k),
    rElbow: lerpPt(POSE_A.rElbow, POSE_B.rElbow, k),
    lHand: lerpPt(POSE_A.lHand, POSE_B.lHand, k),
    rHand: lerpPt(POSE_A.rHand, POSE_B.rHand, k),
    hip: lerpPt(POSE_A.hip, POSE_B.hip, k),
    lHipJ: lerpPt(POSE_A.lHipJ, POSE_B.lHipJ, k),
    rHipJ: lerpPt(POSE_A.rHipJ, POSE_B.rHipJ, k),
    lKnee: lerpPt(POSE_A.lKnee, POSE_B.lKnee, k),
    rKnee: lerpPt(POSE_A.rKnee, POSE_B.rKnee, k),
    lFoot: lerpPt(POSE_A.lFoot, POSE_B.lFoot, k),
    rFoot: lerpPt(POSE_A.rFoot, POSE_B.rFoot, k),
  };

  // Live computed angles
  const elbowAngle = angleAt(joints.rShoulder, joints.rElbow, joints.rHand);
  const kneeAngle = angleAt(joints.rHipJ, joints.rKnee, joints.rFoot);

  // Active event = closest marker within ±0.06 of normalised time
  const norm = duration ? Math.min(1, time / duration) : 0;
  const active = EVENT_MARKERS.find((m) => Math.abs(m.at - norm) < 0.05) ?? null;

  const toneColor =
    active?.tone === "danger" ? "var(--danger)" :
    active?.tone === "warn"   ? "var(--warn)"   :
    "var(--court)";

  return (
    <>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ filter: `drop-shadow(0 0 4px ${toneColor})` }}
      >
        {/* center of mass guideline */}
        <line
          x1={joints.hip[0]} y1={0} x2={joints.hip[0]} y2={100}
          stroke={toneColor} strokeWidth="0.15" strokeDasharray="0.6 0.8" opacity="0.5"
        />
        {/* shoulder line (balance) */}
        <line
          x1={joints.lShoulder[0]} y1={joints.lShoulder[1]}
          x2={joints.rShoulder[0]} y2={joints.rShoulder[1]}
          stroke={toneColor} strokeWidth="0.25" strokeDasharray="0.5 0.6" opacity="0.7"
        />

        {/* skeleton */}
        {LINES.map(([a, b], i) => {
          const [ax, ay] = joints[a];
          const [bx, by] = joints[b];
          return (
            <line
              key={i}
              x1={ax} y1={ay} x2={bx} y2={by}
              stroke={toneColor} strokeWidth="0.4" strokeLinecap="round"
              opacity="0.95"
            />
          );
        })}
        {Object.entries(joints).map(([key, [x, y]]) => (
          <circle key={key} cx={x} cy={y} r="0.7" fill={toneColor} />
        ))}

        {/* live elbow angle */}
        <g>
          <circle cx={joints.rElbow[0]} cy={joints.rElbow[1]} r="2.2"
            fill="none" stroke={toneColor} strokeWidth="0.25" strokeDasharray="0.6 0.6" />
          <text
            x={joints.rElbow[0] + 3} y={joints.rElbow[1] + 1}
            fontSize="2.2" fill={toneColor} fontFamily="Inter, sans-serif"
          >
            {elbowAngle}° elbow
          </text>
        </g>

        {/* live knee angle */}
        <g>
          <circle cx={joints.rKnee[0]} cy={joints.rKnee[1]} r="2"
            fill="none" stroke={toneColor} strokeWidth="0.25" strokeDasharray="0.6 0.6" />
          <text
            x={joints.rKnee[0] + 3} y={joints.rKnee[1] + 1}
            fontSize="2" fill={toneColor} fontFamily="Inter, sans-serif"
          >
            {kneeAngle}° knee
          </text>
        </g>

        {/* hip rotation marker */}
        <g>
          <circle cx={joints.hip[0]} cy={joints.hip[1]} r="2.5"
            fill="none" stroke={toneColor} strokeWidth="0.3" strokeDasharray="0.6 0.6" />
        </g>
      </svg>

      {/* Live cue caption — top-center, fades when an event is active */}
      {active && (
        <div className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 animate-fade-in">
          <div
            className="rounded-full glass px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em]"
            style={{
              color: toneColor,
              boxShadow: `0 0 24px ${toneColor}40`,
              borderColor: `${toneColor}60`,
            }}
          >
            <span
              className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
              style={{ background: toneColor, boxShadow: `0 0 8px ${toneColor}` }}
            />
            {active.label}
          </div>
        </div>
      )}
    </>
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