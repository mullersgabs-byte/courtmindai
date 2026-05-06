import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TabBar } from "@/components/TabBar";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — CourtMind" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<number>(today.getDate());

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long" });
  const year = cursor.getFullYear();

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const arr: (number | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <main className="mx-auto max-w-[420px] px-5 pt-14">
        <p className="text-[13px] text-white/55">{year}</p>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="mt-1 inline-flex items-center gap-2 text-[28px] font-semibold tracking-tight"
        >
          {monthLabel}
          <ChevronDown size={20} className="text-white/55" />
        </button>

        {/* Calendar */}
        <section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
          <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-[0.16em] text-white/45">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {days.map((d, i) =>
              d == null ? (
                <span key={i} className="aspect-square" />
              ) : (
                <button
                  key={i}
                  onClick={() => setSelected(d)}
                  className={`grid aspect-square place-items-center rounded-full text-[12px] font-medium transition ${
                    selected === d
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.03] text-white/80"
                  }`}
                >
                  {d}
                </button>
              ),
            )}
          </div>
        </section>

        {/* Daily activities */}
        <section className="mt-6">
          <p className="text-[12px] uppercase tracking-[0.16em] text-white/55">Daily Activities</p>
          <ul className="mt-3 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            {[
              { name: "Running",      time: "07:00 AM", meta: "0.7 km" },
              { name: "Meditation",   time: "02:00 PM", meta: "15 min" },
              { name: "Gym Training", time: "07:00 PM", meta: "Upper body" },
              { name: "Yoga",         time: "09:45 PM", meta: "Recovery" },
            ].map((a) => (
              <li key={a.name} className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                  <div>
                    <p className="text-[14px] font-medium">{a.name}</p>
                    <p className="text-[11px] text-white/55">{a.meta}</p>
                  </div>
                </div>
                <p className="text-[12px] text-white/55">{a.time}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <TabBar />
    </div>
  );
}