import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Flame, Clock, Activity, Sparkles, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getProfile, type Profile } from "@/lib/profile";
import { TabBar } from "@/components/TabBar";
import { ProgressRing } from "@/components/ui-app/ProgressRing";
import { StatTile } from "@/components/ui-app/StatTile";
import { EmptyState } from "@/components/ui-app/EmptyState";
import { computeStats, getInsight, readHistory, readLastFeedback, syncBadges, type WorkoutEntry, type LastFeedback } from "@/lib/streak";
import { exercisesForSport, recommendedProgram } from "@/lib/programs";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Início — CourtMind" }] }),
  component: HomePage,
});

function HomePage() {
  const { t } = useT();
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<Profile>({});
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [lastFb, setLastFb] = useState<LastFeedback | null>(null);

  useEffect(() => {
    setProfile(getProfile());
    setWorkouts(readHistory());
    setLastFb(readLastFeedback());
    setHydrated(true);
  }, []);

  const greetingKey = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "home.greeting.morning" : h < 18 ? "home.greeting.afternoon" : "home.greeting.evening";
  }, []);

  const stats = useMemo(() => computeStats(workouts), [workouts]);
  useEffect(() => { syncBadges(stats.streak); }, [stats.streak]);

  const insight = useMemo(() => getInsight(workouts, lastFb), [workouts, lastFb]);
  const sport = profile.sport || "tennis";
  const nextExercise = exercisesForSport(sport)[0];
  const program = recommendedProgram(sport);
  const initial = (profile.name || "?").charAt(0).toUpperCase();
  const firstName = (profile.name || "").split(" ")[0] || t("common.guest");

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <header className="mx-auto flex max-w-[480px] items-center justify-between px-5 pt-10">
        <div className="leading-tight">
          <p className="text-[12px] text-muted-foreground">{t(greetingKey)}</p>
          <h1 className="mt-0.5 text-[26px] font-semibold tracking-[-0.025em]">{firstName}</h1>
        </div>
        <Link to="/profile" aria-label={t("profile.title")}
          className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-foreground text-[14px] font-semibold text-background ring-2 ring-foreground/5">
          {profile.photoDataUrl
            ? <img src={profile.photoDataUrl} alt="" className="h-full w-full object-cover" />
            : initial}
        </Link>
      </header>

      <main className="mx-auto mt-6 max-w-[480px] space-y-5 px-5">
        {/* Hero — next session */}
        <section className="relative overflow-hidden rounded-[28px] bg-foreground p-6 text-background shadow-elev">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-background/[0.06] blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em]">
              <Sparkles className="h-3 w-3" /> {t("home.title")}
            </span>
            {program && (
              <span className="text-[10px] uppercase tracking-[0.22em] opacity-70">
                {t("training.program.week").replace("{n}", "1")} · {program.weeks}w
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] opacity-70">{sport}</p>
              <h2 className="mt-1 text-[26px] font-semibold leading-[1.05] tracking-[-0.02em] text-balance">
                {nextExercise ? t(nextExercise.nameKey) : t("home.subtitle")}
              </h2>
              {nextExercise && (
                <p className="mt-1 text-[13px] opacity-75 line-clamp-2">{t(nextExercise.cueKey)}</p>
              )}
            </div>
            <ProgressRing value={stats.goalProgress} size={86} stroke={6} className="text-background">
              <div>
                <p className="num text-[20px] font-semibold leading-none">{stats.sessions}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-70">/{stats.goal}</p>
              </div>
            </ProgressRing>
          </div>

          <Link to="/training"
            className="press tap mt-6 inline-flex w-full items-center justify-between rounded-full bg-background px-5 py-3.5 text-[15px] font-semibold text-foreground">
            <span>{t("home.cta.start")}</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
          <StatTile label={t("home.stat.sessions")} value={stats.sessions} icon={<Activity className="h-3.5 w-3.5" />} />
          <StatTile label={t("home.stat.minutes")} value={stats.minutes} icon={<Clock className="h-3.5 w-3.5" />} />
          <StatTile label={t("home.stat.streak")} value={stats.streak} icon={<Flame className="h-3.5 w-3.5" />} hint={stats.longestStreak > stats.streak ? `${t("home.stat.best") || "best"}: ${stats.longestStreak}` : undefined} />
        </section>

        {/* Insight */}
        {insight && (
          <section className="rounded-3xl border border-foreground/10 surface-1 p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{t("home.insight") || "Insight"}</p>
            </div>
            <p className="mt-3 text-[16px] font-semibold tracking-tight">{insight.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{insight.detail}</p>
            <Link to="/feedback" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-foreground hover:underline">
              {t("training.feedback.details")} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        )}

        {/* Activity */}
        <section>
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{t("home.section.activity")}</p>
            <Link to="/history" className="text-[12px] text-muted-foreground hover:text-foreground">{t("common.continue")}</Link>
          </div>
          {!hydrated ? (
            <div className="space-y-2">
              <div className="skeleton h-14" />
              <div className="skeleton h-14" />
            </div>
          ) : workouts.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-5 w-5" />}
              title={t("profile.empty")}
              action={
                <Link to="/training" className="press tap inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-[13px] font-semibold text-background">
                  {t("home.cta.start")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-foreground/10 surface-1 divide-y divide-foreground/10">
              {workouts.slice(0, 5).map((w) => (
                <li key={w.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{w.title}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(w.date).toLocaleDateString()}</p>
                  </div>
                  <p className="num text-[12px] text-muted-foreground">{w.durationMinutes ?? "—"} min</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <TabBar />
    </div>
  );
}