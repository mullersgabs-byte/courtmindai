import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { TabBar } from "@/components/TabBar";
import { exercisesForSport, recommendedProgram, type Exercise, type Program } from "@/lib/programs";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Feedback — CourtMind" }] }),
  component: FeedbackPage,
});

type StoredFeedback = {
  id: string;
  date: string;
  sport: string;
  exerciseName: string;
  durationSeconds: number;
  overallScore: number;
  verdict: string;
  positives: string[];
  mistakes: string[];
  improvements: string[];
  steps: string[];
};

function FeedbackPage() {
  const { t } = useT();
  const [data, setData] = useState<StoredFeedback | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("courtmind.last_feedback.v1");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-24">
        <header className="px-5 pt-12 pb-4">
          <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{t("feedback.title")}</h1>
        </header>
        <main className="mx-auto max-w-[480px] px-5">
          <section className="rounded-3xl border bg-card p-6 text-center">
            <p className="text-[14px] text-muted-foreground">{t("feedback.empty")}</p>
            <Link to="/training"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3 text-[14px] font-medium text-background hover:opacity-90">
              {t("feedback.start")}
            </Link>
          </section>
        </main>
        <TabBar />
      </div>
    );
  }

  const exercises: Exercise[] = exercisesForSport(data.sport).slice(0, 4);
  const program: Program | undefined = recommendedProgram(data.sport);
  const dateLabel = new Date(data.date).toLocaleString();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="px-5 pt-12 pb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("feedback.title")}</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">{data.exerciseName}</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">{dateLabel}</p>
      </header>

      <main className="mx-auto max-w-[480px] px-5 space-y-6">
        <section className="rounded-3xl border bg-card p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("training.score")}</p>
          <p className="mt-2 text-[64px] font-semibold leading-none tracking-[-0.03em]">
            {Math.round(data.overallScore)}
          </p>
          {data.verdict && <p className="mt-3 text-[14px] text-muted-foreground">{data.verdict}</p>}
        </section>

        {data.positives.length > 0 && (
          <Block title={t("training.feedback.positives")} items={data.positives} />
        )}
        {data.mistakes.length > 0 && (
          <Block title={t("training.feedback.fix")} items={data.mistakes} />
        )}
        {data.improvements.length > 0 && (
          <Block title={t("feedback.improvements")} items={data.improvements} />
        )}
        {data.steps.length > 0 && (
          <Block title={t("training.feedback.steps")} items={data.steps} ordered />
        )}

        <section>
          <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {t("feedback.recommended_exercises")}
          </p>
          <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
            {exercises.map((ex) => (
              <li key={ex.id} className="px-4 py-3">
                <p className="text-[15px] font-medium">{t(ex.nameKey)}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{t(ex.cueKey)}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t("training.seconds").replace("{n}", String(ex.seconds))}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {program && (
          <section className="rounded-3xl border bg-foreground p-5 text-background">
            <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">
              {t("training.program.suggested_after")}
            </p>
            <h2 className="mt-3 text-[20px] font-semibold leading-tight">{t(program.titleKey)}</h2>
            <p className="mt-1 text-[13px] opacity-80">{t(program.descriptionKey)}</p>
            <Link to="/training"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-background px-6 py-3 text-[14px] font-medium text-foreground hover:opacity-90">
              {t("training.program.start")}
            </Link>
          </section>
        )}

        <Link to="/training"
          className="inline-flex w-full items-center justify-center rounded-full border bg-card px-6 py-3.5 text-[15px] font-medium hover:bg-foreground/5">
          {t("training.try_again")}
        </Link>
      </main>

      <TabBar />
    </div>
  );
}

function Block({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <section>
      <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <Tag className={`overflow-hidden rounded-2xl border bg-card ${ordered ? "list-decimal pl-9 py-2 pr-4 space-y-2" : "divide-y"}`}>
        {items.map((it, i) => (
          <li key={i} className={ordered ? "text-[14px]" : "px-4 py-3 text-[14px]"}>{it}</li>
        ))}
      </Tag>
    </section>
  );
}