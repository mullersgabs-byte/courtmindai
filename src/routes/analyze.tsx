import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeVideo, type VideoAnalysis, type VideoEvent } from "@/server/analyze.functions";
import { saveLastAnalysis } from "@/lib/sessionStore";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze — CourtMind Elite" },
      { name: "description", content: "Upload a training video and get precise, AI-graded feedback with evidence frames from your own clip." },
    ],
  }),
  component: AnalyzePage,
});

type Phase = "upload" | "uploading" | "analyzing" | "result" | "error";

function AnalyzePage() {
  const callAnalyze = useServerFn(analyzeVideo);

  const [phase, setPhase] = useState<Phase>("upload");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Uploading video…");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);

  const onPick = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file (MP4, MOV or WebM).");
      setPhase("error");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("This video is larger than 100 MB. Please trim it or compress it.");
      setPhase("error");
      return;
    }

    // Local preview while we upload, so the player has zero perceived latency.
    const url = URL.createObjectURL(file);
    setLocalUrl(url);

    // 1) upload to storage
    setPhase("uploading");
    setProgress(8);
    setStatusText("Uploading your video…");

    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const safeExt = ["mp4", "mov", "webm"].includes(ext) ? ext : "mp4";
    const path = `anon/${crypto.randomUUID()}.${safeExt}`;

    const { error: upErr } = await supabase.storage
      .from("training-videos")
      .upload(path, file, {
        contentType: file.type || `video/${safeExt}`,
        upsert: false,
      });

    if (upErr) {
      console.error(upErr);
      setError("Could not upload the video. Please try again.");
      setPhase("error");
      return;
    }

    // 2) analyse via Gemini
    setPhase("analyzing");
    setProgress(35);
    setStatusText("Reading the video frame by frame…");
    const tickStatuses = [
      "Detecting movement and balance…",
      "Identifying form details…",
      "Looking for execution errors…",
      "Composing your feedback…",
    ];
    let i = 0;
    const interval = window.setInterval(() => {
      setProgress((p) => Math.min(92, p + 3));
      setStatusText(tickStatuses[i % tickStatuses.length]);
      i += 1;
    }, 1200);

    try {
      const result = await callAnalyze({ data: { videoPath: path } });
      window.clearInterval(interval);
      if (result.status === "error") {
        setError(result.error ?? "The AI could not analyse this video.");
        setPhase("error");
        return;
      }
      setProgress(100);
      setAnalysis(result);
      setPhase("result");
      // Persist the last analysis so /plan can build a corrective week from
      // the actual mistakes detected on the athlete's video.
      try {
        saveLastAnalysis({
          id: result.id,
          date: new Date().toISOString(),
          overallScore: result.overallScore,
          verdict: result.verdict,
          events: result.events,
        });
      } catch (err) {
        console.warn("Could not persist last analysis", err);
      }
    } catch (e) {
      window.clearInterval(interval);
      console.error(e);
      setError("Unexpected error during analysis. Please try again.");
      setPhase("error");
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
    setProgress(0);
    if (localUrl) URL.revokeObjectURL(localUrl);
    setLocalUrl(null);
    setPhase("upload");
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/home" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
             Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">Analysis</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-32 pt-10 sm:px-8 sm:pt-16">
        {phase === "upload" && <UploadView onPick={onPick} />}
        {(phase === "uploading" || phase === "analyzing") && (
          <ProgressView progress={progress} status={statusText} />
        )}
        {phase === "error" && (
          <ErrorView message={error ?? "Something went wrong."} onReset={reset} />
        )}
        {phase === "result" && analysis && (
          <ResultView analysis={analysis} localUrl={localUrl} onReset={reset} />
        )}
      </main>
    </div>
  );
}

/* ============== UPLOAD ============== */
function UploadView({ onPick }: { onPick: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div className="animate-float-up">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Step 01</p>
      <h1 className="mt-5 text-balance text-[clamp(2.2rem,6vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
        Send your <span className="font-serif italic font-normal text-court-gradient">training.</span>
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        Upload a short training clip. The AI will watch it and show you, with frames taken from your own video, exactly where you nailed the form and where you slipped.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        onDragEnter={() => setDrag(true)}
        onDragLeave={() => setDrag(false)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
        className={`group relative mt-12 block w-full overflow-hidden rounded-3xl border-2 border-dashed bg-card p-10 text-left transition sm:p-14 ${
          drag ? "border-foreground bg-foreground/5" : "border-foreground/25 hover:border-foreground/60 hover:bg-foreground/[0.03]"
        }`}
      >
        <div className="relative flex flex-col items-center justify-center gap-5 py-6 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-foreground/30 font-serif text-3xl leading-none">
            ↑
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Drop your video here</p>
            <p className="mt-2 text-[clamp(1.4rem,2.6vw,2rem)] font-medium leading-tight tracking-tight">
              Click to browse, or drag a file into this area
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">MP4, MOV or WebM · up to 100 MB · 10–60 seconds is ideal</p>
          </div>
          <span className="mt-2 inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-background transition group-hover:opacity-90">
            Choose video file
          </span>
        </div>
      </button>

      {/* How it works */}
      <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border hairline bg-foreground/10 sm:grid-cols-3">
        <Step n="01" title="Upload" detail="Drop a clip in the area above." />
        <Step n="02" title="AI watches" detail="It scans frame by frame for hits and slips." />
        <Step n="03" title="See evidence" detail="A gallery of frames from your own video, tagged." />
      </ol>

      <div className="mt-12 rounded-2xl border hairline glass p-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">For best precision</p>
        <ul className="mt-4 grid gap-3 text-[14px] text-foreground/85 sm:grid-cols-2">
          <li className="flex items-start gap-3"> Keep the full body in frame</li>
          <li className="flex items-start gap-3"> Side angle, stable camera</li>
          <li className="flex items-start gap-3"> Good, even lighting</li>
          <li className="flex items-start gap-3"> 10–60 seconds is ideal</li>
        </ul>
      </div>
    </div>
  );
}

function Step({ n, title, detail }: { n: string; title: string; detail: string }) {
  return (
    <li className="bg-background p-5">
      <p className="font-serif text-2xl tracking-tight text-muted-foreground">{n}</p>
      <p className="mt-3 text-[14px] font-medium tracking-tight">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </li>
  );
}

/* ============== PROGRESS ============== */
function ProgressView({ progress, status }: { progress: number; status: string }) {
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
          <span className="text-3xl font-medium tracking-tight">
            {Math.round(progress)}<span className="text-[14px] text-muted-foreground">%</span>
          </span>
        </div>
      </div>
      <p className="mt-10 text-[11px] uppercase tracking-[0.24em] text-court">AI Analysis</p>
      <h2 className="mt-3 text-balance text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-tight tracking-tight">
        {status}
      </h2>
      <p className="mt-4 text-[14px] text-muted-foreground">This usually takes between 30 seconds and 2 minutes.</p>
    </div>
  );
}

/* ============== ERROR ============== */
function ErrorView({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center animate-fade-in">
      <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-danger/10 text-danger glow-danger">
        
      </span>
      <h2 className="mt-6 text-2xl font-medium tracking-tight">Analysis failed</h2>
      <p className="mt-3 text-[14px] text-muted-foreground">{message}</p>
      <button
        onClick={onReset}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-court px-5 py-3 text-[13px] font-medium text-ink glow-court"
      >
        Try another video
      </button>
    </div>
  );
}

/* ============== RESULT ============== */
function ResultView({
  analysis, localUrl, onReset,
}: { analysis: VideoAnalysis; localUrl: string | null; onReset: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [activeEventIdx, setActiveEventIdx] = useState<number | null>(null);

  // Sync video state
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

  const seekToEvent = (idx: number) => {
    const e = analysis.events[idx];
    const v = videoRef.current;
    if (!v || !e) return;
    v.currentTime = Math.min(e.time_seconds, Math.max(0, (duration || e.time_seconds) - 0.05));
    v.play().catch(() => {});
    setActiveEventIdx(idx);
    // smooth-scroll the player into view on small screens
    v.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const seekBar = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  };

  // Source: prefer local blob URL (instant), fall back to public URL
  const src = localUrl ?? analysis.videoUrl;
  const progress = duration ? t / duration : 0;

  return (
    <div className="animate-float-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Analysis complete</p>
          <h1 className="mt-3 text-balance text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Your form, <span className="font-serif italic font-normal text-court-gradient">decoded.</span>
          </h1>
          {analysis.verdict && (
            <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">{analysis.verdict}</p>
          )}
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 text-[12px] text-muted-foreground transition hover:text-foreground hover:border-court/40"
        >
          New analysis
        </button>
      </div>

      {/* Video player */}
      <div className="relative mt-10 overflow-hidden rounded-3xl border hairline bg-card">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={src}
            crossOrigin={localUrl ? undefined : "anonymous"}
            playsInline
            loop
            muted
            className="absolute inset-0 h-full w-full object-contain"
          />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-court animate-pulse-court" />
            Your video
          </div>
          <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] text-foreground">
            
            Analysed by AI
          </div>

          {/* Active event label */}
          {activeEventIdx !== null && analysis.events[activeEventIdx] && (
            <div className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 animate-fade-in">
              <EventBadge ev={analysis.events[activeEventIdx]} large />
            </div>
          )}

          {/* Timeline */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-background to-transparent p-5">
            <button
              onClick={togglePlay}
              className="grid h-10 w-10 place-items-center rounded-full bg-court text-[11px] font-medium uppercase tracking-[0.18em] text-ink glow-court-soft"
            >
              {playing ? "II" : "▸"}
            </button>
            <div className="flex-1">
              <div onClick={seekBar} className="relative h-2 cursor-pointer rounded-full bg-foreground/15">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-court glow-court-soft"
                  style={{ width: `${progress * 100}%` }}
                />
                {analysis.events.map((ev, i) => {
                  if (!duration) return null;
                  const left = Math.min(100, (ev.time_seconds / duration) * 100);
                  const color =
                    ev.type === "bad"  ? "bg-danger" :
                    ev.type === "warn" ? "bg-warn"   : "bg-success";
                  return (
                    <button
                      key={i}
                      title={ev.title}
                      onClick={(e) => { e.stopPropagation(); seekToEvent(i); }}
                      className={`absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-sm ${color}`}
                      style={{ left: `${left}%` }}
                    />
                  );
                })}
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

      {/* Score */}
      <OverallScore score={analysis.overallScore} verdict={analysis.verdict} />

      {/* EVIDENCE GALLERY — frames from the actual video */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-court">Evidence</p>
            <h2 className="mt-3 text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-tight">
              What the AI saw — moment by moment
            </h2>
            <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">
              Tap any card to jump the player to that exact moment in your video.
            </p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Legend tone="success" label="Did well" />
            <Legend tone="warn" label="Improve" />
            <Legend tone="danger" label="Mistake" />
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {analysis.events.map((ev, i) => (
            <EvidenceCard
              key={i}
              ev={ev}
              videoSrc={src}
              onSeek={() => seekToEvent(i)}
              active={activeEventIdx === i}
            />
          ))}
        </div>
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

function toneOf(t: VideoEvent["type"]) {
  // Solid colored pills for high-contrast tags
  if (t === "bad")  return { label: "Mistake", color: "var(--danger)",  text: "text-danger",  bg: "bg-danger",  pillText: "text-background", chipBg: "bg-danger/15",  chipText: "text-danger",  glow: "glow-danger", border: "border-danger/50",  dot: "bg-danger" };
  if (t === "warn") return { label: "Improve", color: "var(--warn)",    text: "text-warn",    bg: "bg-warn",    pillText: "text-background", chipBg: "bg-warn/15",    chipText: "text-warn",    glow: "glow-warn",   border: "border-warn/50",    dot: "bg-warn" };
  return                 { label: "Good",    color: "var(--court)",   text: "text-success", bg: "bg-success", pillText: "text-background", chipBg: "bg-success/15", chipText: "text-success", glow: "",            border: "border-success/50", dot: "bg-success" };
}

function Legend({ tone, label }: { tone: "success" | "warn" | "danger"; label: string }) {
  const c = tone === "danger" ? "bg-danger" : tone === "warn" ? "bg-warn" : "bg-success";
  return (
    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${c}`} /> {label}
    </span>
  );
}

function EventBadge({ ev, large }: { ev: VideoEvent; large?: boolean }) {
  const tn = toneOf(ev.type);
  return (
    <div
      className={`rounded-full glass px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] ${large ? "" : ""}`}
      style={{ color: tn.color, boxShadow: `0 0 24px ${tn.color}40`, borderColor: `${tn.color}60` }}
    >
      <span
        className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
        style={{ background: tn.color, boxShadow: `0 0 8px ${tn.color}` }}
      />
      {ev.title}
    </div>
  );
}

/* ---------- Score block ---------- */
function OverallScore({ score, verdict }: { score: number; verdict: string }) {
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
        <div className="flex items-center gap-3 text-muted-foreground">
          
          <p className="max-w-md text-right text-[14px]">{verdict || "Solid base — refine the details below."}</p>
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

/* ---------- Evidence card with frame extraction ---------- */
function EvidenceCard({
  ev, videoSrc, onSeek, active,
}: {
  ev: VideoEvent;
  videoSrc: string;
  onSeek: () => void;
  active: boolean;
}) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tn = toneOf(ev.type);

  // Extract a frame at ev.time_seconds with a hidden <video> + <canvas>.
  useEffect(() => {
    let cancelled = false;
    const v = document.createElement("video");
    v.src = videoSrc;
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";

    const onLoaded = () => {
      const target = Math.min(ev.time_seconds, (v.duration || ev.time_seconds) - 0.05);
      v.currentTime = Math.max(0, target);
    };
    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = v.videoWidth || 640;
        const h = v.videoHeight || 360;
        // downscale for snappy gallery
        const scale = Math.min(1, 720 / w);
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL("image/jpeg", 0.82);
          if (!cancelled) setThumb(url);
        }
      } catch (err) {
        // canvas can be tainted if storage CDN doesn't return CORS headers;
        // we fail gracefully and just skip the thumbnail.
        console.warn("Frame capture failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("error", () => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("seeked", onSeeked);
      v.src = "";
    };
  }, [ev.time_seconds, videoSrc]);

  return (
    <button
      onClick={onSeek}
      className={`group relative overflow-hidden rounded-2xl border bg-card text-left transition ${
        active ? `${tn.border} ${tn.glow}` : "hairline hover:border-court/40 hover:glow-court-soft"
      }`}
    >
      {/* Frame */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {thumb ? (
          <img src={thumb} alt={ev.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            {loading ? "Loading…" : ""}
          </div>
        )}
        {/* Gradient + tone tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div
          className="absolute inset-0 mix-blend-screen opacity-30"
          style={{ background: `linear-gradient(180deg, transparent 60%, ${tn.color}40)` }}
        />

        {/* Tag */}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-sm ${tn.bg} ${tn.pillText}`}
            style={{ boxShadow: `0 4px 14px ${tn.color}55` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-background/80" />
            {tn.label}
          </span>
        </div>

        {/* Timestamp */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[11px] tabular-nums text-foreground/90 backdrop-blur">
          {fmt(ev.time_seconds)}
        </div>

        {/* Hover play hint */}
        <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-court text-ink glow-court">
            
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-1.5 p-5">
        <p className={`text-[15px] font-medium leading-snug ${tn.text}`}>{ev.title}</p>
        <p className="text-[13px] leading-relaxed text-muted-foreground">{ev.detail}</p>
        {ev.body_part && (
          <p className="pt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Focus · {ev.body_part}
          </p>
        )}
      </div>
    </button>
  );
}