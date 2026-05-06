import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Plus, ArrowUpRight, Sparkles } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { getProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourtMind" },
      { name: "description", content: "Premium training app." },
    ],
  }),
  component: Index,
});

type Filter = "all" | "alone" | "friends";

type Activity = {
  id: string;
  name: string;
  time: string;
  participants: number;
  group: "alone" | "friends";
};

const ACTIVITIES: Activity[] = [
  { id: "running", name: "Running",    time: "7:00 AM",  participants: 2, group: "friends" },
  { id: "gym",     name: "Gym",        time: "8:00 PM",  participants: 3, group: "friends" },
  { id: "med",     name: "Meditation", time: "10:30 PM", participants: 1, group: "alone"   },
];

function Index() {
  const [name, setName] = useState("Athlete");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const p = getProfile();
    if (p?.name) setName(p.name.split(" ")[0]);
  }, []);

  const list = ACTIVITIES.filter((a) =>
    filter === "all" ? true : filter === "alone" ? a.group === "alone" : a.group === "friends",
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <main className="mx-auto max-w-[420px] px-5 pt-14">
        {/* Top */}
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-white/55">Hello,</p>
            <h1 className="mt-0.5 text-[26px] font-semibold tracking-tight">{name}</h1>
            <h2 className="mt-5 text-[28px] font-semibold leading-[1.1] tracking-tight">
              Ready for Today’s<br />Challenges?
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80"
            >
              <Bell size={16} strokeWidth={1.75} />
            </button>
            <Link
              to="/profile"
              aria-label="Profile"
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-white/15 to-white/5 text-[13px] font-medium text-white/80"
            >
              {name.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Filters */}
        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {([
            { id: "all",     label: "All" },
            { id: "alone",   label: "Alone" },
            { id: "friends", label: "With Friends" },
          ] as { id: Filter; label: string }[]).map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                  active ? "bg-white text-black" : "text-white/65 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Activity grid */}
        <section className="mt-5 grid grid-cols-2 gap-3">
          {list.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
          <AddCard />
        </section>

        {/* AI Coach shortcut */}
        <Link
          to="/coach"
          className="mt-5 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[14px] font-medium transition hover:bg-white/[0.07]"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles size={16} strokeWidth={1.75} />
            AI Coach
          </span>
          <ArrowUpRight size={16} className="text-white/55" />
        </Link>
      </main>

      <TabBar />
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const isHero = activity.id === "running";
  return (
    <Link
      to="/coach"
      className={`group relative flex aspect-[1/1.05] flex-col justify-between overflow-hidden rounded-3xl p-4 transition ${
        isHero
          ? "bg-white text-black"
          : "border border-white/10 bg-white/[0.04] text-white"
      }`}
      style={{
        boxShadow: isHero
          ? "0 14px 40px oklch(1 0 0 / 0.12)"
          : "0 10px 30px oklch(0 0 0 / 0.45)",
      }}
    >
      <div className="flex items-start justify-between">
        <Participants count={activity.participants} dark={!isHero} />
        <span
          className={`grid h-7 w-7 place-items-center rounded-full ${
            isHero ? "bg-black/10 text-black" : "bg-white/10 text-white/80"
          }`}
        >
          <ArrowUpRight size={14} strokeWidth={1.75} />
        </span>
      </div>
      <div>
        <p className="text-[17px] font-semibold leading-tight">{activity.name}</p>
        <p className={`mt-1 text-[12px] ${isHero ? "text-black/60" : "text-white/55"}`}>
          {activity.time}
        </p>
      </div>
    </Link>
  );
}

function Participants({ count, dark }: { count: number; dark: boolean }) {
  const ring = dark ? "ring-[oklch(0.16_0_0)]" : "ring-white";
  const bg = dark ? "bg-white/15 text-white/80" : "bg-black/10 text-black/70";
  return (
    <div className="flex -space-x-2">
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <span
          key={i}
          className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-medium ring-2 ${ring} ${bg}`}
        >
          {String.fromCharCode(65 + i)}
        </span>
      ))}
    </div>
  );
}

function AddCard() {
  return (
    <Link
      to="/coach"
      className="grid aspect-[1/1.05] place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] text-white/65 transition hover:border-white/30 hover:text-white"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <Plus size={18} strokeWidth={1.75} />
        </span>
        <span className="text-[12px] font-medium">Add Activity</span>
      </div>
    </Link>
  );
}

function Index() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen max-w-[480px] flex-col px-5 pb-8 pt-5">
        <header className="flex items-center justify-between py-2">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t("app.ready")}</p>
            <h1 className="mt-1 text-[30px] font-semibold leading-tight">CourtMind</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-[14px] font-medium text-foreground transition hover:bg-card"
            >
              {t("auth.title.signin")}
            </Link>
          </div>
        </header>

        <section className="mt-8 rounded-[2rem] border bg-card p-6 shadow-sm">
          <p className="text-[13px] font-medium text-muted-foreground">{t("home.title")}</p>
          <h2 className="mt-3 text-[34px] font-semibold leading-tight">{t("app.main.title")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t("app.main.subtitle")}</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <Link
              to="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-[15px] font-medium text-background transition hover:opacity-90"
            >
              {t("app.start")}
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-12 items-center justify-center rounded-full border px-5 text-[15px] font-medium transition hover:bg-background"
            >
              {t("app.login")}
            </Link>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <Stat value="0" label={t("home.stat.sessions")} />
          <Stat value="0" label={t("home.stat.minutes")} />
          <Stat value="0" label={t("home.stat.streak")} />
        </section>

        <section className="mt-6 space-y-3">
          <p className="px-1 text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t("app.sections")}</p>
          <Feature title={t("training.title")} description={t("training.subtitle")} to="/training" />
          <Feature title={t("profile.title")} description={t("app.profile.description")} to="/profile" />
          <Feature title={t("profile.notifications")} description={t("notif.body")} to="/profile" />
        </section>

        <div className="mt-auto pt-8">
          <Link
            to="/home"
            className="flex items-center justify-between rounded-3xl border bg-card px-5 py-4 text-[15px] font-medium transition hover:bg-background"
          >
            <span>{t("app.open.home")}</span>
            <span className="text-muted-foreground">{t("common.continue")}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border bg-card p-4 text-center">
      <p className="text-[24px] font-semibold leading-none">{value}</p>
      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Feature({ title, description, to }: { title: string; description: string; to: "/training" | "/profile" }) {
  return (
    <Link to={to} className="block rounded-3xl border bg-card px-5 py-4 transition hover:bg-background">
      <p className="text-[16px] font-semibold">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
    </Link>
  );
}
