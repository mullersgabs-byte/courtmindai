import { createFileRoute, Link } from "@tanstack/react-router";
import { TabBar } from "@/components/TabBar";
import { ChevronLeft, Plus } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — Traino" }] }),
  component: EventsPage,
});

const EVENTS = [
  { title: "Pickup basketball", when: "Sat · 18:00", where: "Court 2", going: 6 },
  { title: "Morning run group", when: "Sun · 07:30", where: "River park", going: 12 },
  { title: "Gym session",       when: "Mon · 19:00", where: "Studio One", going: 3 },
];

function EventsPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-36">
      <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[440px] items-center gap-3 px-5 py-4">
          <Link to="/friends" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04]"><ChevronLeft size={16} /></Link>
          <h1 className="text-[18px] font-semibold tracking-tight">Events</h1>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-black"><Plus size={13} /> New</button>
        </div>
      </header>

      <ul className="mx-auto max-w-[440px] space-y-3 px-5 pt-5">
        {EVENTS.map((e) => (
          <li key={e.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{e.when}</p>
            <p className="mt-2 text-[18px] font-semibold tracking-tight">{e.title}</p>
            <p className="mt-1 text-[13px] text-white/55">{e.where} · {e.going} going</p>
            <button className="mt-4 w-full rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-black">Join</button>
          </li>
        ))}
      </ul>
      <TabBar />
    </div>
  );
}
