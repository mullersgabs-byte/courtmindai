import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n";
import { getProfile, type Profile } from "@/lib/profile";
import { TabBar } from "@/components/TabBar";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — CourtMind" }] }),
  component: HomePage,
});

type WorkoutEntry = { id: string; date: string; title: string; durationMinutes?: number };

function HomePage() {
  const { t } = useT();
  const [profile, setProfile] = useState<Profile>({});
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    setProfile(getProfile());
    try { setWorkouts(JSON.parse(localStorage.getItem("courtmind.history.v1") || "[]")); } catch {}
  }, []);

  const greetingKey = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "home.greeting.morning" : h < 18 ? "home.greeting.afternoon" : "home.greeting.evening";
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 86400_000;
    const week = workouts.filter((w) => +new Date(w.date) >= weekAgo);
    const minutes = week.reduce((s, w) => s + (w.durationMinutes || 0), 0);
    const days = new Set(workouts.map((w) => new Date(w.date).toISOString().slice(0, 10)));
    let streak = 0; const d = new Date();
    for (;;) {
      const k = d.toISOString().slice(0, 10);
      if (days.has(k)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    return { sessions: week.length, minutes, streak };
  }, [workouts]);

  const initial = (profile.name || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 bg-radial-court">
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-court">{t(greetingKey)}</p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.03em]">{profile.name || "Athlete"}</h1>
          </div>
          <Link to="/profile" className="grid h-11 w-11 place-items-center rounded-full border border-court/40 bg-card text-[14px] font-semibold overflow-hidden glow-court-soft">
            {profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="" className="h-full w-full object-cover" /> : initial}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-5 space-y-6">
        {/* Hero card — start session */}
        <section className="relative overflow-hidden rounded-3xl border border-court/30 bg-card p-6 glow-court-soft">
          <div className="absolute inset-0 bg-radial-court pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.28em] text-court">{t("home.title")}</p>
            <p className="mt-4 text-[28px] font-semibold tracking-[-0.03em] leading-tight">
              {profile.sport ? profile.sport.toUpperCase() : "READY TO TRAIN"}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">{profile.goal || t("home.subtitle")}</p>
            <Link to="/training"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-court px-6 py-3.5 text-[14px] font-semibold uppercase tracking-[0.16em] text-ink glow-court transition hover:brightness-110">
              {t("home.cta.start")}
            </Link>
          </div>
        </section>

        {/* Metrics */}
        <section>
          <p className="px-1 pb-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{t("home.section.this_week")}</p>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t("home.stat.sessions")} value={String(stats.sessions)} />
            <Stat label={t("home.stat.minutes")} value={String(stats.minutes)} accent />
            <Stat label={t("home.stat.streak")} value={String(stats.streak)} />
          </div>
        </section>

        {/* Activity */}
        <section>
          <p className="px-1 pb-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{t("home.section.activity")}</p>
          {workouts.length === 0 ? (
            <div className="rounded-2xl border bg-card p-5 text-[13px] text-muted-foreground">—</div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
              {workouts.slice(0, 5).map((w) => (
                <li key={w.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-court" />
                    <div>
                      <p className="text-[14px] font-medium">{w.title}</p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{new Date(w.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-mono text-[13px] text-muted-foreground">{w.durationMinutes ?? "—"} MIN</p>
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-card p-4 ${accent ? "border-court/40" : ""}`}>
      <p className={`text-mono text-[32px] font-semibold leading-none tracking-[-0.04em] ${accent ? "text-court-gradient" : ""}`}>{value}</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    </div>
  );
}