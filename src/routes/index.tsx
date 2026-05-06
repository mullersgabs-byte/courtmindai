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
