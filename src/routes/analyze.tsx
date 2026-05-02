import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import {
  analyzeFromFrames,
  analyzeWorkoutText,
  type FrameAnalysis,
  type TextWorkoutAnalysis,
  type VideoEvent,
} from "@/server/analyze.functions";
import { saveLastAnalysis } from "@/lib/sessionStore";
import { useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analisar — CourtMind Elite" },
      {
        name: "description",
        content:
          "Envie um vídeo de treino ou descreva sua sessão e receba uma análise técnica com pontos fortes, erros e plano de melhoria.",
      },
    ],
  }),
  component: AnalyzePage,
});

type Mode = "video" | "text";
type Phase = "input" | "preparing" | "analyzing" | "result" | "blocked" | "error";

function AnalyzePage() {
  const callFrames = useServerFn(analyzeFromFrames);
  const callText = useServerFn(analyzeWorkoutText);
  const t = useT();
  const lang = useLang();

  const [mode, setMode] = useState<Mode>("video");
  const [phase, setPhase] = useState<Phase>("input");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<FrameAnalysis | null>(null);
  const [textAnalysis, setTextAnalysis] = useState<TextWorkoutAnalysis | null>(null);

  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const [sport, setSport] = useState("tennis");
  const [notes, setNotes] = useState("");
  const [textInput, setTextInput] = useState("");

  const reset = () => {
    setAnalysis(null);
    setTextAnalysis(null);
    setError(null);
    setProgress(0);
    if (localUrl) URL.revokeObjectURL(localUrl);
    setLocalUrl(null);
    setPhase("input");
  };

  /* ----------- VIDEO PIPELINE ----------- */
  const onPickVideo = async (file: File) => {
    setError(null);

    // Accept ANY video format the browser can read.
    if (!file.type.startsWith("video/") && !/\.(mp4|mov|m4v|webm|avi|mkv|3gp)$/i.test(file.name)) {
      setError("Por favor escolha um arquivo de vídeo.");
      setPhase("error");
      return;
    }
    // Soft guardrail (500 MB) to avoid browser memory crashes.
    if (file.size > 500 * 1024 * 1024) {
      setError("Vídeo acima de 500 MB. Por favor envie um clipe menor.");
      setPhase("error");
      return;
    }

    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    setPhase("preparing");
    setProgress(5);
    setStatusText("Preparando vídeo…");

    try {
      // 1) extract frames in browser (no upload required for analysis)
      const { frames, durationSeconds } = await extractFrames(url, 6, (p) => {
        setProgress(5 + Math.round(p * 45)); // 5 → 50
        setStatusText("Lendo o vídeo quadro a quadro…");
      });
      setDuration(durationSeconds);

      // 2) call AI with retry
      setPhase("analyzing");
      setProgress(55);
      setStatusText("Analisando técnica e postura…");

      const tickStatuses = [
        "Detectando movimento e equilíbrio…",
        "Identificando postura e execução…",
        "Procurando erros técnicos…",
        "Montando seu feedback personalizado…",
      ];
      let i = 0;
      const interval = window.setInterval(() => {
        setProgress((p) => Math.min(94, p + 2));
        setStatusText(tickStatuses[i % tickStatuses.length]);
        i += 1;
      }, 1400);

      const result = await callWithRetry(() =>
        callFrames({
          data: {
            frames,
            durationSeconds,
            sport,
            notes,
            language: lang as "pt" | "en" | "es" | "fr",
          },
        }),
      );

      window.clearInterval(interval);

      if (result.status === "blocked") {
        setError(result.error ?? "Conteúdo bloqueado pela moderação.");
        setPhase("blocked");
        return;
      }
      if (result.status === "error") {
        setError(result.error ?? "Falha na análise.");
        setPhase("error");
        return;
      }

      setProgress(100);
      setAnalysis(result);
      setPhase("result");

      try {
        if (result.id) {
          saveLastAnalysis({
            id: result.id,
            date: new Date().toISOString(),
            overallScore: result.overallScore,
            verdict: result.verdict,
            events: result.events,
          });
        }
      } catch {
        /* noop */
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erro inesperado. Tente novamente.");
      setPhase("error");
    }
  };

  /* ----------- TEXT PIPELINE ----------- */
  const onSubmitText = async () => {
    setError(null);
    if (textInput.trim().length < 10) {
      setError("Descreva seu treino com pelo menos 10 caracteres.");
      setPhase("error");
      return;
    }
    setPhase("analyzing");
    setProgress(40);
    setStatusText("Analisando seu treino…");

    try {
      const result = await callWithRetry(() =>
        callText({
          data: {
            description: textInput.trim(),
            sport,
            language: lang as "pt" | "en" | "es" | "fr",
          },
        }),
      );

      if (result.status === "blocked") {
        setError(result.error ?? "Conteúdo bloqueado.");
        setPhase("blocked");
        return;
      }
      if (result.status === "error") {
        setError(result.error ?? "Falha na análise.");
        setPhase("error");
        return;
      }
      setProgress(100);
      setTextAnalysis(result);
      setPhase("result");
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erro inesperado.");
      setPhase("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground"
          >
            ← Home
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">
            {t("Análise", { en: "Analysis", es: "Análisis", fr: "Analyse" })}
          </p>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-32 pt-10 sm:px-8 sm:pt-16">
        {phase === "input" && (
          <InputView
            mode={mode}
            setMode={setMode}
            sport={sport}
            setSport={setSport}
            notes={notes}
            setNotes={setNotes}
            textInput={textInput}
            setTextInput={setTextInput}
            onPickVideo={onPickVideo}
            onSubmitText={onSubmitText}
          />
        )}
        {(phase === "preparing" || phase === "analyzing") && (
          <ProgressView progress={progress} status={statusText} />
        )}
        {phase === "blocked" && (
          <BlockedView message={error ?? "Conteúdo bloqueado."} onReset={reset} />
        )}
        {phase === "error" && (
          <ErrorView
            message={error ?? "Algo deu errado."}
            onReset={reset}
            onRetry={mode === "text" ? onSubmitText : undefined}
          />
        )}
        {phase === "result" && analysis && (
          <VideoResultView analysis={analysis} localUrl={localUrl} duration={duration} onReset={reset} />
        )}
        {phase === "result" && textAnalysis && (
          <TextResultView analysis={textAnalysis} onReset={reset} />
        )}
      </main>
    </div>
  );
}

/* ============== INPUT (video or text) ============== */
function InputView({
  mode, setMode,
  sport, setSport,
  notes, setNotes,
  textInput, setTextInput,
  onPickVideo, onSubmitText,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  sport: string;
  setSport: (s: string) => void;
  notes: string;
  setNotes: (s: string) => void;
  textInput: string;
  setTextInput: (s: string) => void;
  onPickVideo: (f: File) => void;
  onSubmitText: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div className="animate-float-up">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Etapa 01</p>
      <h1 className="mt-5 text-balance text-[clamp(2.2rem,6vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
        Envie seu <span className="font-serif italic font-normal text-court-gradient">treino.</span>
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        Mande um vídeo curto ou descreva sua sessão. A IA observa quadro a quadro e devolve pontos
        fortes, erros e como corrigir.
      </p>

      {/* Mode toggle */}
      <div className="mt-10 inline-flex rounded-full border hairline p-1">
        <button
          onClick={() => setMode("video")}
          className={`rounded-full px-5 py-2 text-[13px] transition ${
            mode === "video" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🎥 Vídeo
        </button>
        <button
          onClick={() => setMode("text")}
          className={`rounded-full px-5 py-2 text-[13px] transition ${
            mode === "text" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          ✍️ Texto
        </button>
      </div>

      {/* Sport selector — shared */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">Esporte</label>
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="rounded-full border hairline bg-card px-4 py-2 text-[13px]"
        >
          <option value="tennis">Tênis</option>
          <option value="padel">Padel</option>
          <option value="football">Futebol</option>
          <option value="basketball">Basquete</option>
          <option value="volleyball">Vôlei</option>
          <option value="running">Corrida</option>
          <option value="gym">Academia / Musculação</option>
          <option value="crossfit">CrossFit</option>
          <option value="boxing">Boxe / Luta</option>
          <option value="yoga">Yoga / Mobilidade</option>
          <option value="general athletics">Outro / Geral</option>
        </select>
      </div>

      {mode === "video" ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickVideo(f);
              e.target.value = "";
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
              if (f) onPickVideo(f);
            }}
            className={`group relative mt-8 block w-full overflow-hidden rounded-3xl border-2 border-dashed bg-card p-10 text-left transition sm:p-14 ${
              drag
                ? "border-foreground bg-foreground/5"
                : "border-foreground/25 hover:border-foreground/60 hover:bg-foreground/[0.03]"
            }`}
          >
            <div className="relative flex flex-col items-center justify-center gap-5 py-6 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-foreground/30 font-serif text-3xl leading-none">
                ↑
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Solte seu vídeo aqui
                </p>
                <p className="mt-2 text-[clamp(1.4rem,2.6vw,2rem)] font-medium leading-tight tracking-tight">
                  Clique para escolher ou arraste um arquivo
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Qualquer formato (MP4, MOV, AVI, WebM…) · até 500 MB · 10–60 s é o ideal
                </p>
              </div>
              <span className="mt-2 inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-background transition group-hover:opacity-90">
                Escolher vídeo
              </span>
            </div>
          </button>

          <div className="mt-6">
            <label className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='ex.: "Treinando saque slice, foco em rotação de quadril."'
              rows={2}
              className="mt-2 w-full rounded-2xl border hairline bg-card p-4 text-[14px] outline-none focus:border-court/50"
            />
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-3xl border hairline bg-card p-6 sm:p-8">
          <label className="text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
            Descreva seu treino
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder='ex.: "Fiz 4x10 agachamento livre com 80kg, supino 3x8 com 60kg, senti o joelho cair pra dentro."'
            rows={6}
            className="mt-3 w-full rounded-2xl border hairline bg-background p-4 text-[14px] outline-none focus:border-court/50"
          />
          <button
            onClick={onSubmitText}
            disabled={textInput.trim().length < 10}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-court px-6 py-3 text-[13px] font-medium text-ink glow-court disabled:opacity-40"
          >
            Analisar treino
          </button>
        </div>
      )}

      {/* How it works */}
      <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border hairline bg-foreground/10 sm:grid-cols-3">
        <Step n="01" title="Envie" detail="Vídeo de qualquer tamanho ou texto descritivo." />
        <Step n="02" title="IA observa" detail="Quadros são lidos e moderados antes da análise." />
        <Step n="03" title="Receba o feedback" detail="Acertos, erros e passos para melhorar." />
      </ol>
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
      <p className="mt-10 text-[11px] uppercase tracking-[0.24em] text-court">Análise IA</p>
      <h2 className="mt-3 text-balance text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-tight tracking-tight">
        {status || "Trabalhando…"}
      </h2>
      <p className="mt-4 text-[14px] text-muted-foreground">Costuma levar entre 15 e 60 segundos.</p>
    </div>
  );
}

/* ============== ERROR / BLOCKED ============== */
function ErrorView({
  message, onReset, onRetry,
}: {
  message: string;
  onReset: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center animate-fade-in">
      <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-danger/10 text-danger glow-danger">!</span>
      <h2 className="mt-6 text-2xl font-medium tracking-tight">Análise falhou</h2>
      <p className="mt-3 text-[14px] text-muted-foreground">{message}</p>
      <div className="mt-8 flex justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full bg-court px-5 py-3 text-[13px] font-medium text-ink glow-court"
          >
            Tentar novamente
          </button>
        )}
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border hairline px-5 py-3 text-[13px] text-muted-foreground hover:text-foreground"
        >
          Recomeçar
        </button>
      </div>
    </div>
  );
}

function BlockedView({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center animate-fade-in">
      <span className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-warn/10 text-warn">⚠</span>
      <h2 className="mt-6 text-2xl font-medium tracking-tight">Conteúdo não aceito</h2>
      <p className="mt-3 text-[14px] text-muted-foreground">{message}</p>
      <button
        onClick={onReset}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-[13px] font-medium text-background"
      >
        Enviar outro
      </button>
    </div>
  );
}

/* ============== VIDEO RESULT ============== */
function VideoResultView({
  analysis, localUrl, duration: _duration, onReset,
}: {
  analysis: FrameAnalysis;
  localUrl: string | null;
  duration: number;
  onReset: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0);
  const [duration, setDuration] = useState(_duration);
  const [playing, setPlaying] = useState(true);
  const [activeEventIdx, setActiveEventIdx] = useState<number | null>(null);

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
    v.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const seekBar = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
  };

  const src = localUrl ?? "";
  const progress = duration ? t / duration : 0;

  return (
    <div className="animate-float-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Análise concluída</p>
          <h1 className="mt-3 text-balance text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Sua técnica, <span className="font-serif italic font-normal text-court-gradient">decodificada.</span>
          </h1>
          {analysis.verdict && (
            <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">{analysis.verdict}</p>
          )}
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 text-[12px] text-muted-foreground transition hover:text-foreground hover:border-court/40"
        >
          Nova análise
        </button>
      </div>

      {/* Video player */}
      {src && (
        <div className="relative mt-10 overflow-hidden rounded-3xl border hairline bg-card">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              src={src}
              playsInline
              loop
              muted
              className="absolute inset-0 h-full w-full object-contain"
            />
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-court animate-pulse-court" />
              Seu vídeo
            </div>

            {activeEventIdx !== null && analysis.events[activeEventIdx] && (
              <div className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 animate-fade-in">
                <EventBadge ev={analysis.events[activeEventIdx]} />
              </div>
            )}

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
                    const color = ev.type === "bad" ? "bg-danger" : ev.type === "warn" ? "bg-warn" : "bg-success";
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
                </div>
              </div>
              <p className="text-[12px] tabular-nums text-foreground/80">
                {fmt(t)} / {fmt(duration)}
              </p>
            </div>
          </div>
        </div>
      )}

      <OverallScore score={analysis.overallScore} verdict={analysis.verdict} />

      <FeedbackGrid
        positives={analysis.positives}
        mistakes={analysis.mistakes}
        improvements={analysis.improvements}
        steps={analysis.steps}
      />

      {analysis.events.length > 0 && (
        <section className="mt-14">
          <p className="text-[11px] uppercase tracking-[0.24em] text-court">Linha do tempo</p>
          <h2 className="mt-3 text-[clamp(1.4rem,2.6vw,2rem)] font-medium tracking-tight">
            Momentos detectados pela IA
          </h2>
          <div className="mt-6 space-y-3">
            {analysis.events.map((ev, i) => {
              const tn = toneOf(ev.type);
              return (
                <button
                  key={i}
                  onClick={() => seekToEvent(i)}
                  className={`block w-full rounded-2xl border bg-card p-5 text-left transition ${
                    activeEventIdx === i ? `${tn.border}` : "hairline hover:border-court/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${tn.bg} ${tn.pillText}`}>
                      {tn.label}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={`text-[15px] font-medium ${tn.text}`}>{ev.title}</p>
                        <span className="text-[11px] tabular-nums text-muted-foreground">{fmt(ev.time_seconds)}</span>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground">{ev.detail}</p>
                      {ev.body_part && (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Foco · {ev.body_part}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function TextResultView({ analysis, onReset }: { analysis: TextWorkoutAnalysis; onReset: () => void }) {
  return (
    <div className="animate-float-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">Análise concluída</p>
          <h1 className="mt-3 text-balance text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Seu treino, <span className="font-serif italic font-normal text-court-gradient">avaliado.</span>
          </h1>
          {analysis.verdict && (
            <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">{analysis.verdict}</p>
          )}
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 text-[12px] text-muted-foreground hover:text-foreground"
        >
          Nova análise
        </button>
      </div>
      <OverallScore score={analysis.overallScore} verdict={analysis.verdict} />
      <FeedbackGrid
        positives={analysis.positives}
        mistakes={analysis.mistakes}
        improvements={analysis.improvements}
        steps={analysis.steps}
      />
    </div>
  );
}

function FeedbackGrid({
  positives, mistakes, improvements, steps,
}: {
  positives: string[];
  mistakes: string[];
  improvements: string[];
  steps: string[];
}) {
  return (
    <section className="mt-12 grid gap-5 md:grid-cols-2">
      <FeedbackCard title="O que você acertou" items={positives} tone="success" />
      <FeedbackCard title="Erros detectados" items={mistakes} tone="danger" />
      <FeedbackCard title="Como melhorar" items={improvements} tone="warn" />
      <FeedbackCard title="Próximos passos" items={steps} tone="court" ordered />
    </section>
  );
}

function FeedbackCard({
  title, items, tone, ordered,
}: {
  title: string;
  items: string[];
  tone: "success" | "danger" | "warn" | "court";
  ordered?: boolean;
}) {
  const dot =
    tone === "success" ? "bg-success" :
    tone === "danger" ? "bg-danger" :
    tone === "warn" ? "bg-warn" : "bg-court";
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className="rounded-2xl border hairline bg-card p-6">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{title}</p>
      <Tag className={`mt-4 space-y-3 ${ordered ? "list-decimal pl-5" : ""}`}>
        {items.length === 0 && <li className="text-[13px] text-muted-foreground">—</li>}
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 text-[14px] leading-relaxed">
            {!ordered && <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}
            <span>{it}</span>
          </li>
        ))}
      </Tag>
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
  if (t === "bad")  return { label: "Erro",    text: "text-danger",  bg: "bg-danger",  pillText: "text-background", border: "border-danger/50"  };
  if (t === "warn") return { label: "Ajustar", text: "text-warn",    bg: "bg-warn",    pillText: "text-background", border: "border-warn/50"    };
  return                 { label: "Bom",     text: "text-success", bg: "bg-success", pillText: "text-background", border: "border-success/50" };
}

function EventBadge({ ev }: { ev: VideoEvent }) {
  const tn = toneOf(ev.type);
  return (
    <div className={`rounded-full glass px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] ${tn.text}`}>
      {ev.title}
    </div>
  );
}

function OverallScore({ score, verdict }: { score: number; verdict: string }) {
  const pct = (score / 10) * 100;
  return (
    <section className="mt-10 overflow-hidden rounded-2xl border hairline bg-card p-7">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-court">Nota geral</p>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="text-[clamp(3rem,7vw,5.5rem)] font-medium leading-none tracking-[-0.04em] text-court-gradient">
              {score.toFixed(1)}
            </span>
            <span className="text-[18px] text-muted-foreground">/ 10</span>
          </p>
        </div>
        <p className="max-w-md text-right text-[14px] text-muted-foreground">
          {verdict || "Boa base — refine os detalhes abaixo."}
        </p>
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

/* ---------- frame extraction (browser) ---------- */
async function extractFrames(
  src: string,
  count: number,
  onProgress: (p: number) => void,
): Promise<{ frames: string[]; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    video.addEventListener("error", () => {
      cleanup();
      reject(new Error("Não foi possível ler este arquivo de vídeo."));
    });

    video.addEventListener("loadedmetadata", async () => {
      const duration = isFinite(video.duration) ? video.duration : 0;
      if (!duration || duration < 0.2) {
        cleanup();
        reject(new Error("Vídeo muito curto ou sem duração detectável."));
        return;
      }

      const w = video.videoWidth || 640;
      const h = video.videoHeight || 360;
      const scale = Math.min(1, 720 / w);
      const cw = Math.round(w * scale);
      const ch = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cleanup();
        reject(new Error("Canvas indisponível."));
        return;
      }

      const frames: string[] = [];
      const targets: number[] = [];
      // sample evenly between 5% and 95% of the duration
      for (let i = 0; i < count; i++) {
        const pct = 0.05 + (i / Math.max(1, count - 1)) * 0.9;
        targets.push(Math.min(duration - 0.05, Math.max(0, pct * duration)));
      }

      const seekTo = (time: number) =>
        new Promise<void>((res) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            res();
          };
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
        cleanup();
        resolve({ frames, durationSeconds: duration });
      } catch (err) {
        cleanup();
        reject(err);
      }
    });
  });
}

/* ---------- retry helper ---------- */
async function callWithRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}
