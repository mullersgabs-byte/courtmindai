import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, saveProfile, type Profile } from "@/lib/profile";
import { useTheme } from "@/lib/theme";
import { useT, LANGUAGES, type Lang } from "@/lib/i18n";
import { notifPermission, requestNotifPermission, startDailyReminder, notifSupported } from "@/lib/notifications";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — CourtMind" }] }),
  component: ProfilePage,
});

type WorkoutEntry = { id: string; date: string; title: string; sport?: string; durationMinutes?: number };

function readWorkouts(): WorkoutEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("courtmind.history.v1") || "[]"); } catch { return []; }
}

function ProfilePage() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useT();
  const { mode, setMode } = useTheme();
  const [profile, setProfileState] = useState<Profile>({});
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [email, setEmail] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfileState(getProfile());
    setWorkouts(readWorkouts());
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  // wire daily reminder
  useEffect(() => {
    if (!profile.notifEnabled || !profile.notifTime) return;
    const stop = startDailyReminder(profile.notifTime, "CourtMind", t("home.cta.start"));
    return stop;
  }, [profile.notifEnabled, profile.notifTime, t]);

  const update = (patch: Profile) => {
    const next = { ...profile, ...patch };
    setProfileState(next);
    saveProfile(patch);
  };

  const onPhoto = (file: File) => {
    const r = new FileReader();
    r.onload = () => update({ photoDataUrl: String(r.result) });
    r.readAsDataURL(file);
  };

  const enableNotifs = async () => {
    const p = await requestNotifPermission();
    if (p === "granted") update({ notifEnabled: true, notifTime: profile.notifTime || "18:00" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const stats = useMemo(() => {
    const total = workouts.length;
    const minutes = workouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);
    const days = new Set(workouts.map((w) => new Date(w.date).toISOString().slice(0, 10)));
    let streak = 0; const d = new Date();
    for (;;) {
      const k = d.toISOString().slice(0, 10);
      if (days.has(k)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    return { total, minutes, streak };
  }, [workouts]);

  const initial = (profile.name || email || "?").charAt(0).toUpperCase();
  const perm = typeof window !== "undefined" ? notifPermission() : "default";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-5 py-4">
          <Link to="/home" className="text-[14px] text-muted-foreground hover:text-foreground">{t("common.back")}</Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">{t("profile.title")}</p>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 pb-24 pt-8 space-y-8">
        {/* Identity */}
        <section className="flex flex-col items-center text-center">
          <button onClick={() => fileRef.current?.click()} className="relative">
            {profile.photoDataUrl ? (
              <img src={profile.photoDataUrl} alt="" className="h-24 w-24 rounded-full object-cover ring-1 ring-border" />
            ) : (
              <span className="grid h-24 w-24 place-items-center rounded-full bg-foreground text-3xl font-medium text-background">{initial}</span>
            )}
            <span className="absolute bottom-0 right-0 rounded-full border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wider">{t("common.edit")}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} />
          {profile.photoDataUrl && (
            <button onClick={() => update({ photoDataUrl: undefined })} className="mt-2 text-[12px] text-muted-foreground hover:text-foreground">{t("profile.photo.remove")}</button>
          )}
          <h1 className="mt-5 text-2xl font-medium tracking-tight">{profile.name || t("common.guest")}</h1>
          {email && <p className="mt-1 text-[13px] text-muted-foreground">{email}</p>}
        </section>

        {/* Workout stats */}
        <section className="grid grid-cols-3 gap-3">
          <Stat label={t("profile.stat.workouts")} value={String(stats.total)} />
          <Stat label={t("profile.stat.minutes")} value={String(stats.minutes)} />
          <Stat label={t("profile.stat.streak")} value={String(stats.streak)} />
        </section>

        {/* Edit profile */}
        <Group title={t("profile.edit")}>
          <Row label={t("profile.name")}>
            <input value={profile.name || ""} onChange={(e) => update({ name: e.target.value })}
              className="w-full bg-transparent text-right text-[15px] focus:outline-none" placeholder="—" />
          </Row>
          <Row label={t("profile.email")}>
            <input value={profile.email || ""} onChange={(e) => update({ email: e.target.value })}
              className="w-full bg-transparent text-right text-[15px] focus:outline-none" placeholder={email || "—"} />
          </Row>
        </Group>

        {/* Training */}
        <Group title={t("profile.training")}>
          <Row label={t("profile.sport")}>
            <input value={profile.sport || ""} onChange={(e) => update({ sport: e.target.value })}
              className="w-full bg-transparent text-right text-[15px] focus:outline-none" placeholder="—" />
          </Row>
          <Row label={t("profile.level")}>
            <select value={profile.level || ""} onChange={(e) => update({ level: e.target.value as Profile["level"] })}
              className="bg-transparent text-right text-[15px] focus:outline-none">
              <option value="">—</option>
              <option value="beginner">{t("onb.level.beginner")}</option>
              <option value="intermediate">{t("onb.level.intermediate")}</option>
              <option value="advanced">{t("onb.level.advanced")}</option>
            </select>
          </Row>
          <Row label={t("profile.goal")}>
            <input value={profile.goal || ""} onChange={(e) => update({ goal: e.target.value })}
              className="w-full bg-transparent text-right text-[15px] focus:outline-none" placeholder="—" />
          </Row>
          <Row label={t("profile.frequency")}>
            <input value={profile.frequency || ""} onChange={(e) => update({ frequency: e.target.value })}
              className="w-full bg-transparent text-right text-[15px] focus:outline-none" placeholder="—" />
          </Row>
        </Group>

        {/* Language */}
        <Group title={t("common.language")}>
          <Row label={t("common.language")}>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-transparent text-right text-[15px] focus:outline-none">
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </Row>
        </Group>

        {/* Theme */}
        <Group title={t("profile.appearance")}>
          <div className="flex gap-2 p-1">
            {(["system", "light", "dark"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 rounded-xl px-3 py-2 text-[13px] transition ${mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                {t(`profile.theme.${m}`)}
              </button>
            ))}
          </div>
        </Group>

        {/* Notifications */}
        <Group title={t("profile.notifications")}>
          {!notifSupported() ? (
            <p className="px-4 py-3 text-[13px] text-muted-foreground">—</p>
          ) : perm === "denied" ? (
            <p className="px-4 py-3 text-[13px] text-muted-foreground">{t("profile.notif.blocked")}</p>
          ) : perm !== "granted" ? (
            <button onClick={enableNotifs} className="w-full px-4 py-3 text-left text-[15px] text-foreground hover:bg-foreground/5">{t("profile.notif.allow")}</button>
          ) : (
            <>
              <Row label={t("profile.notif.enable")}>
                <input type="checkbox" checked={!!profile.notifEnabled}
                  onChange={(e) => update({ notifEnabled: e.target.checked })} className="h-5 w-5" />
              </Row>
              <Row label={t("profile.notif.time")}>
                <input type="time" value={profile.notifTime || "18:00"}
                  onChange={(e) => update({ notifTime: e.target.value })}
                  className="bg-transparent text-right text-[15px] focus:outline-none" />
              </Row>
            </>
          )}
        </Group>

        {/* Account */}
        <Group title={t("profile.account")}>
          <button onClick={signOut} className="w-full px-4 py-3 text-left text-[15px] text-destructive hover:bg-foreground/5">{t("profile.signout")}</button>
        </Group>
      </main>
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

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <div className="overflow-hidden rounded-2xl border bg-card divide-y">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-[14px] text-muted-foreground">{label}</span>
      <span className="flex-1 max-w-[60%] text-right">{children}</span>
    </label>
  );
}