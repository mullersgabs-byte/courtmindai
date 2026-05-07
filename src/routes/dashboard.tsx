import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TabBar } from "@/components/TabBar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Statistics — Traino" }] }),
  component: DashboardPage,
});

const RANGES = ["Daily", "Weekly", "Monthly"] as const;

function DashboardPage() {
  const [range, setRange] = useState<typeof RANGES[number]>("Weekly");
  const data = range === "Daily" ? [22,38,15,52,40,28,60] : range === "Weekly" ? [180,220,260,310,290,340,380] : [820,950,1100,1240];
  const labels = range === "Daily" ? ["M","T","W","T","F","S","S"] : range === "Weekly" ? ["W1","W2","W3","W4","W5","W6","W7"] : ["Jan","Feb","Mar","Apr"];

  return (
    <div className="min-h-screen bg-black text-white pb-36">
      <header className="px-5 pt-12 pb-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Statistics</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em]">Performance</h1>
      </header>

      <div className="mx-auto max-w-[440px] px-5">
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-full px-4 py-1.5 text-[13px] font-medium ${range === r ? "bg-white text-black" : "text-white/65"}`}>{r}</button>
          ))}
        </div>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[12px] text-white/55">Workout time</p>
          <p className="mt-1 text-[26px] font-semibold tracking-tight">{data.reduce((a,b)=>a+b,0)} min</p>
          <Bars values={data} labels={labels} />
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card k="Calories" v="2 480" sub="last 7 days" />
          <Card k="Streak"   v="5 days" sub="personal best 12" />
          <Card k="Sleep"    v="7h 12m" sub="avg" />
          <Card k="Heart"    v="62 bpm" sub="resting" />
        </div>

        <section className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[12px] text-white/55">Performance evolution</p>
          <Line values={[62,68,71,76,82,85,88]} />
          <p className="mt-3 text-[12px] text-white/55">+26 points over 7 sessions</p>
        </section>
      </div>

      <TabBar />
    </div>
  );
}

function Bars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values);
  return (
    <div className="mt-5 flex h-32 items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-md bg-white" style={{ height: `${(v / max) * 100}%`, opacity: 0.45 + (v / max) * 0.55 }} />
          <span className="text-[10px] text-white/45">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Line({ values }: { values: number[] }) {
  const w = 320, h = 90, max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full">
      <polyline points={pts} fill="none" stroke="white" strokeWidth="1.5" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / (max - min)) * h;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="white" />;
      })}
    </svg>
  );
}

function Card({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{k}</p>
      <p className="mt-1.5 text-[20px] font-semibold tracking-tight">{v}</p>
      <p className="mt-0.5 text-[11px] text-white/40">{sub}</p>
    </div>
  );
}
