import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { getProfile } from "@/lib/profile";
import { TabBar } from "@/components/TabBar";
import { analyzeFromFrames } from "@/server/analyze.functions";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training — CourtMind" }] }),
  component: TrainingPage,
});

type Phase = "idle" | "recording" | "analyzing" | "result" | "error";
type Result = {
  overallScore: number;
  verdict: string;
  positives: string[];
  mistakes: string[];
  improvements: string[];
  steps: string[];
};

const WORKOUTS = ["Push-ups", "Squats", "Lunges", "Plank", "Burpees", "Jumping jacks"];

function TrainingPage() {
  const { t, lang } = useT();
  const [workout, setWorkout] = useState<string>(WORKOUTS[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const startRecording = async () => {
    setError(""); setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      chunksRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        await analyze(url);
      };
      recRef.current = rec;
      rec.start();
      setPhase("recording");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera unavailable.");
      setPhase("error");
    }
  };

  const stopRecording = () => {
    if (recRef.current && recRef.current.state !== "inactive") {
      setPhase("analyzing");
      recRef.current.stop();
    }
  };

  const analyze = async (url: string) => {
    try {
      setProgress(0);
      const { frames, durationSeconds } = await extractFrames(url, 6, setProgress);
      const profile = getProfile();
      const res = await analyzeFromFrames({
        data: {
          frames, durationSeconds,
          sport: profile.sport || workout, level: profile.level || "intermediate",
          language: lang,
        },
      } as any);
      if (res.status !== "ok") throw new Error(res.error || "Analysis failed.");
      // Save workout entry
      try {
        const list = JSON.parse(localStorage.getItem("courtmind.history.v1") || "[]");
        list.unshift({ id: crypto.randomUUID(), date: new Date().toISOString(), title: workout, durationMinutes: Math.max(1, Math.round(durationSeconds / 60)) });
        localStorage.setItem("courtmind.history.v1", JSON.stringify(list));
      } catch {}
      setResult({
        overallScore: res.overallScore,
        verdict: res.verdict,
        positives: res.positives,
        mistakes: res.mistakes,
        improvements: res.improvements,
        steps: res.steps,
      });
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not analyze.");
      setPhase("error");
    }
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(""); setResult(null); setError(""); setPhase("idle");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{t("training.title")}</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">{t("training.subtitle")}</p>
      </header>

      <main className="mx-auto max-w-[480px] px-5 space-y-6">
        {phase === "idle" && (
          <>
            <section>
              <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("training.pick")}</p>
              <div className="overflow-hidden rounded-2xl border bg-card divide-y">
                {WORKOUTS.map((w) => (
                  <button key={w} onClick={() => setWorkout(w)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-[15px] transition hover:bg-foreground/5 ${
                      workout === w ? "font-medium" : "text-muted-foreground"
                    }`}>
                    {w}
                    {workout === w && <span className="text-[12px] uppercase tracking-wider">·</span>}
                  </button>
                ))}
              </div>
            </section>

            <p className="text-center text-[13px] text-muted-foreground">{t("training.tip")}</p>

            <button onClick={startRecording}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background hover:opacity-90">
              {t("training.record")}
            </button>
          </>
        )}

        {(phase === "recording") && (
          <>
            <div className="overflow-hidden rounded-3xl border bg-black aspect-[3/4]">
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              {t("training.recording")}
            </div>
            <button onClick={stopRecording}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background hover:opacity-90">
              {t("training.stop")}
            </button>
          </>
        )}

        {phase === "analyzing" && (
          <div className="rounded-3xl border bg-card p-8 text-center">
            <p className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground">{t("training.analyzing")}</p>
            <div className="mx-auto mt-6 h-1 w-full max-w-[240px] overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full bg-foreground transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <>
            {previewUrl && (
              <div className="overflow-hidden rounded-3xl border bg-black aspect-[3/4]">
                <video src={previewUrl} controls playsInline className="h-full w-full object-cover" />
              </div>
            )}
            <section className="rounded-3xl border bg-card p-6 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("training.score")}</p>
              <p className="mt-2 text-[56px] font-semibold leading-none tracking-[-0.03em]">{Math.round(result.overallScore)}</p>
              <p className="mt-3 text-[14px] text-muted-foreground">{result.verdict}</p>
            </section>
            {result.positives.length > 0 && <FeedbackList title={t("training.feedback.positives")} items={result.positives} />}
            {result.mistakes.length > 0 && <FeedbackList title={t("training.feedback.fix")} items={result.mistakes} />}
            {result.steps.length > 0 && <FeedbackList title={t("training.feedback.steps")} items={result.steps} />}
            <button onClick={reset}
              className="inline-flex w-full items-center justify-center rounded-full border bg-card px-6 py-3.5 text-[15px] font-medium hover:bg-foreground/5">
              {t("training.try_again")}
            </button>
          </>
        )}

        {phase === "error" && (
          <>
            <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-[14px] text-destructive">{error}</div>
            <button onClick={reset}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background hover:opacity-90">
              {t("common.reset")}
            </button>
          </>
        )}
      </main>

      <TabBar />
    </div>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
        {items.map((it, i) => <li key={i} className="px-4 py-3 text-[14px]">{it}</li>)}
      </ul>
    </section>
  );
}

/* ---------- frame extraction ---------- */
async function extractFrames(src: string, count: number, onProgress: (p: number) => void): Promise<{ frames: string[]; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = src; video.muted = true; video.playsInline = true; video.preload = "auto";
    video.addEventListener("error", () => reject(new Error("Could not read video.")));
    video.addEventListener("loadedmetadata", async () => {
      const duration = isFinite(video.duration) ? video.duration : 0;
      if (!duration || duration < 0.2) return reject(new Error("Video too short."));
      const w = video.videoWidth || 640, h = video.videoHeight || 360;
      const scale = Math.min(1, 720 / w);
      const cw = Math.round(w * scale), ch = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable."));
      const frames: string[] = [];
      const targets: number[] = [];
      for (let i = 0; i < count; i++) {
        const pct = 0.05 + (i / Math.max(1, count - 1)) * 0.9;
        targets.push(Math.min(duration - 0.05, pct * duration));
      }
      const seekTo = (time: number) => new Promise<void>((res) => {
        const onSeeked = () => { video.removeEventListener("seeked", onSeeked); res(); };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = time;
      });
      try {
        for (let i = 0; i < targets.length; i++) {
          await seekTo(targets[i]);
          ctx.drawImage(video, 0, 0, cw, ch);
          frames.push(canvas.toDataURL("image/jpeg", 0.78));
          onProgress((i + 1) / targets.length);
        }
        resolve({ frames, durationSeconds: duration });
      } catch (err) { reject(err); }
    });
  });
}