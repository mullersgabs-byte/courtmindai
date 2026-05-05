import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { getProfile } from "@/lib/profile";
import { TabBar } from "@/components/TabBar";
import { analyzeFromFrames } from "@/server/analyze.functions";
import {
  exercisesForSport,
  recommendedProgram,
  enroll,
  getEnrollment,
  type Exercise,
  type Program,
} from "@/lib/programs";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training — CourtMind" }] }),
  component: TrainingPage,
});

type Phase = "intro" | "permission" | "ready" | "recording" | "analyzing" | "result" | "error";
type Result = {
  overallScore: number;
  verdict: string;
  positives: string[];
  mistakes: string[];
  improvements: string[];
  steps: string[];
};

type PermState = "unknown" | "prompt" | "granted" | "denied";

function TrainingPage() {
  const { t, lang } = useT();
  const profile = useMemo(() => getProfile(), []);
  const sport = profile.sport || "tennis";
  const exercises = useMemo<Exercise[]>(() => exercisesForSport(sport), [sport]);
  const program = useMemo<Program | undefined>(() => recommendedProgram(sport), [sport]);
  const [enrollment, setEnrollment] = useState(() => getEnrollment());

  const [phase, setPhase] = useState<Phase>("intro");
  const [permission, setPermission] = useState<PermState>("unknown");
  const [activeExercise, setActiveExercise] = useState<Exercise>(exercises[0]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // probe permissions on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await (navigator.permissions as any)?.query?.({ name: "camera" });
        if (!cancelled && status) {
          setPermission(status.state as PermState);
          status.onchange = () => setPermission(status.state as PermState);
        }
      } catch {
        /* ignore — we will ask on use */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const askPermission = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      // we only wanted permission — release immediately
      stream.getTracks().forEach((tr) => tr.stop());
      setPermission("granted");
      setPhase("ready");
    } catch {
      setPermission("denied");
    }
  };

  const goToReady = async () => {
    if (permission === "granted") { setPhase("ready"); return; }
    setPhase("permission");
  };

  const startRecording = async () => {
    setError(""); setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setPermission("granted");
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
        streamRef.current?.getTracks().forEach((tr) => tr.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        await analyze(url);
      };
      recRef.current = rec;
      rec.start();
      setPhase("recording");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera unavailable.");
      setPermission("denied");
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
      const res = await analyzeFromFrames({
        data: {
          frames, durationSeconds,
          sport, level: profile.level || "intermediate",
          language: lang,
          notes: t(activeExercise.nameKey),
        },
      } as any);
      if (res.status !== "done") throw new Error(res.error || "Analysis failed.");
      const analysisRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        sport,
        exerciseId: activeExercise.id,
        exerciseName: t(activeExercise.nameKey),
        durationSeconds,
        overallScore: res.overallScore,
        verdict: res.verdict,
        positives: res.positives,
        mistakes: res.mistakes,
        improvements: res.improvements,
        steps: res.steps,
      };
      try {
        localStorage.setItem("courtmind.last_feedback.v1", JSON.stringify(analysisRecord));
      } catch {}
      try {
        const list = JSON.parse(localStorage.getItem("courtmind.history.v1") || "[]");
        list.unshift({
          id: analysisRecord.id,
          date: analysisRecord.date,
          title: t(activeExercise.nameKey),
          sport,
          durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
        });
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
    setPreviewUrl(""); setResult(null); setError("");
    setPhase(permission === "granted" ? "ready" : "intro");
  };

  const onEnroll = () => {
    if (!program) return;
    setEnrollment(enroll(program.id));
  };

  const sportLabel = t(`sport.${sport.toLowerCase?.() || sport}`) || sport;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{t("training.title")}</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {t("training.exercises.for").replace("{sport}", sportLabel)}
        </p>
      </header>

      <main className="mx-auto max-w-[480px] px-5 space-y-6">
        {phase === "intro" && (
          <>
            <ExerciseList
              title={t("training.exercises.today")}
              exercises={exercises}
              active={activeExercise}
              onPick={setActiveExercise}
              t={t}
            />

            {enrollment && program && enrollment.programId === program.id && (
              <section className="rounded-3xl border bg-card p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t("training.program.continue")}
                </p>
                <p className="mt-2 text-[15px] font-medium">{t(program.titleKey)}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {t("training.program.week").replace("{n}", String(enrollment.currentWeek))} · {program.weeks} {t("program.weeks_label").toLowerCase()}
                </p>
              </section>
            )}

            <button onClick={goToReady}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background hover:opacity-90">
              {t("training.start_analysis")}
            </button>
          </>
        )}

        {phase === "permission" && (
          <section className="rounded-3xl border bg-card p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("training.permission.title")}</p>
            <p className="mt-3 text-[15px] leading-relaxed">{t("training.permission.body")}</p>
            <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/60" />{t("training.permission.point1")}</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/60" />{t("training.permission.point2")}</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-foreground/60" />{t("training.permission.point3")}</li>
            </ul>
            <button onClick={askPermission}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background hover:opacity-90">
              {t("training.permission.allow")}
            </button>
            <button onClick={() => setPhase("intro")}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-[13px] font-medium text-muted-foreground hover:text-foreground">
              {t("common.cancel")}
            </button>
            {permission === "denied" && (
              <p className="mt-3 text-[13px] text-destructive">{t("training.permission.denied")}</p>
            )}
          </section>
        )}

        {phase === "ready" && (
          <>
            <section className="rounded-3xl border bg-card p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("training.exercises.today")}</p>
              <p className="mt-3 text-[20px] font-semibold">{t(activeExercise.nameKey)}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{t(activeExercise.cueKey)}</p>
              <p className="mt-3 text-[12px] text-muted-foreground">
                {t("training.seconds").replace("{n}", String(activeExercise.seconds))}
              </p>
            </section>

            <p className="text-center text-[13px] text-muted-foreground">{t("training.tip")}</p>

            <button onClick={startRecording}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background hover:opacity-90">
              {t("training.record")}
            </button>
          </>
        )}

        {phase === "recording" && (
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

            <Link to="/feedback"
              className="inline-flex w-full items-center justify-center rounded-full border bg-card px-6 py-3.5 text-[15px] font-medium hover:bg-foreground/5">
              {t("training.feedback.details")}
            </Link>

            {/* Suggested program after analysis */}
            {program && (
              <ProgramCard
                program={program}
                enrolled={enrollment?.programId === program.id}
                onEnroll={onEnroll}
                t={t}
                heading={t("training.program.suggested_after")}
                highlight
              />
            )}

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

function ProgramCard({
  program, enrolled, onEnroll, t, heading, highlight,
}: {
  program: Program;
  enrolled: boolean;
  onEnroll: () => void;
  t: (k: string) => string;
  heading?: string;
  highlight?: boolean;
}) {
  return (
    <section className={`rounded-3xl border p-5 ${highlight ? "bg-foreground text-background" : "bg-card"}`}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {heading || t("training.program.suggested")}
      </p>
      <h2 className="mt-3 text-[20px] font-semibold leading-tight">{t(program.titleKey)}</h2>
      <p className={`mt-1 text-[13px] ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{t(program.descriptionKey)}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Mini label={t("program.weeks_label")} value={String(program.weeks)} />
        <Mini label={t("program.sessions_label")} value={String(program.sessionsPerWeek)} />
        <Mini label={t("program.level_label")} value={t("program.level.all")} />
      </div>
      <button onClick={onEnroll} disabled={enrolled}
        className={`mt-5 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-[14px] font-medium transition ${
          enrolled
            ? "border bg-card text-muted-foreground"
            : highlight
              ? "bg-background text-foreground hover:opacity-90"
              : "bg-foreground text-background hover:opacity-90"
        }`}>
        {enrolled ? t("training.program.enrolled") : t("training.program.start")}
      </button>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background p-3">
      <p className="text-[15px] font-semibold">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    </div>
  );
}

function ExerciseList({
  title, exercises, active, onPick, t,
}: {
  title: string;
  exercises: Exercise[];
  active: Exercise;
  onPick: (e: Exercise) => void;
  t: (k: string) => string;
}) {
  return (
    <section>
      <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
        {exercises.map((ex) => {
          const isActive = ex.id === active.id;
          return (
            <li key={ex.id}>
              <button onClick={() => onPick(ex)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-foreground/5 ${
                  isActive ? "bg-foreground/5" : ""
                }`}>
                <div>
                  <p className={`text-[15px] ${isActive ? "font-semibold" : "font-medium"}`}>{t(ex.nameKey)}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{t(ex.cueKey)}</p>
                </div>
                <span className="text-[12px] text-muted-foreground">
                  {t("training.seconds").replace("{n}", String(ex.seconds))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
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
