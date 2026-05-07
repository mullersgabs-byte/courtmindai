import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TabBar } from "@/components/TabBar";
import { Search, UserPlus, MessageSquare, CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/friends")({
  head: () => ({ meta: [{ title: "Friends — Traino" }] }),
  component: FriendsPage,
});

const SUGGESTED = [
  { name: "Pedro A.", sport: "Tennis" },
  { name: "Carla R.", sport: "Running" },
  { name: "Hugo M.",  sport: "Gym" },
];

function FriendsPage() {
  const [q, setQ] = useState("");
  const list = SUGGESTED.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white pb-36">
      <header className="px-5 pt-12 pb-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Community</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em]">Friends</h1>
      </header>

      <div className="mx-auto max-w-[440px] px-5">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5">
          <Search size={15} className="text-white/55" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search athletes" className="flex-1 bg-transparent text-[13px] placeholder:text-white/35 focus:outline-none" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link to="/messages" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] font-medium">
            <MessageSquare size={15} /> Messages
          </Link>
          <Link to="/events" className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] font-medium">
            <CalendarPlus size={15} /> Events
          </Link>
        </div>

        <p className="mt-7 px-1 text-[11px] uppercase tracking-[0.22em] text-white/45">Suggested</p>
        {list.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center text-[13px] text-white/55">Add friends to start sharing workouts.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            {list.map((u) => (
              <li key={u.name} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-[12px] font-semibold">
                  {u.name.split(" ").map((s) => s[0]).join("")}
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium leading-tight">{u.name}</p>
                  <p className="text-[12px] text-white/45">{u.sport}</p>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-black">
                  <UserPlus size={13} /> Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TabBar />
    </div>
  );
}
