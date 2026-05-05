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
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-muted-foreground">{t(greetingKey)}</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em]">{profile.name || "—"}</h1>
          </div>
          <Link to="/profile" className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-[14px] font-medium text-background overflow-hidden">
            {profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="" className="h-full w-full object-cover" /> : initial}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-5 space-y-6">
        {/* Today */}
        <section className="rounded-3xl border bg-card p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("home.title")}</p>
          <p className="mt-3 text-[22px] font-medium tracking-tight">{profile.sport || t("home.subtitle")}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{profile.goal || t("home.subtitle")}</p>
          <Link to="/training"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background transition hover:opacity-90">
            {t("home.cta.start")}
          </Link>
        </section>

        {/* This week */}
        <section>
          <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("home.section.this_week")}</p>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={t("home.stat.sessions")} value={String(stats.sessions)} />
            <Stat label={t("home.stat.minutes")} value={String(stats.minutes)} />
            <Stat label={t("home.stat.streak")} value={String(stats.streak)} />
          </div>
        </section>

        {/* Activity */}
        <section>
          <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t("home.section.activity")}</p>
          {workouts.length === 0 ? (
            <div className="rounded-2xl border bg-card p-5 text-[14px] text-muted-foreground">—</div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
              {workouts.slice(0, 5).map((w) => (
                <li key={w.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-[14px] font-medium">{w.title}</p>
                    <p className="text-[12px] text-muted-foreground">{new Date(w.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-[13px] text-muted-foreground">{w.durationMinutes ?? "—"} min</p>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 text-center">
      <p className="text-2xl font-medium tracking-tight">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  );
}