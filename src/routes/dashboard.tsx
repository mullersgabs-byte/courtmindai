import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TabBar } from "@/components/TabBar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Statistics — CourtMind" }] }),
  component: StatisticsPage,
});

type Range = "daily" | "weekly" | "monthly";

function StatisticsPage() {
  const [range, setRange] = useState<Range>("weekly");

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <main className="mx-auto max-w-[420px] px-5 pt-14">
        <header className="flex items-center justify-between">
          <span className="h-9 w-9" />
          <h1 className="text-[18px] font-semibold tracking-tight">Statistics</h1>
          <button className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70">
            ×
          </button>
        </header>

        {/* Range tabs */}
        <div className="mx-auto mt-6 inline-flex w-full items-center justify-between rounded-full border border-white/10 bg-white/[0.04] p-1">
          {(["daily","weekly","monthly"] as Range[]).map((r) => {
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex-1 rounded-full px-4 py-2 text-[13px] font-medium capitalize transition ${
                  active ? "bg-white text-black" : "text-white/65"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-center text-[12px] text-white/55">Jun 9, 2024 — Jun 15, 2024</p>

        {/* Physical activity card */}
        <section className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[15px] font-semibold">Physical Activity</p>
          <p className="text-[12px] text-white/55">Total for the week</p>
          <div className="mt-4 h-16">
            <BarChart values={[12, 18, 9, 22, 14, 26, 19, 24, 16, 21, 12, 28, 15, 22]} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Mini label="Steps" value="67,735" />
            <Mini label="Calories" value="28,735" />
            <Mini label="Time" value="8h 37m" />
          </div>
        </section>

        {/* Pair: steps / calories */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MetricCard title="Steps" subtitle="Average" value="8,796" hint="Goal: 8,000" />
          <MetricCard title="Calories" subtitle="Average" value="700" hint="Goal: 850" />
        </div>

        {/* Pair: heart / sleep */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MetricCard title="Heart rate" subtitle="Average" value="72 bpm" chart={<LineChart values={[60,68,62,75,70,78,72]} />} />
          <MetricCard title="Sleep" subtitle="Average" value="7h 12m" chart={<LineChart values={[6.4,7.1,6.9,7.4,6.8,7.6,7.2]} />} />
        </div>

        {/* Training time card */}
        <section className="mt-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[12px] uppercase tracking-[0.16em] text-white/50">Training time</p>
          <p className="mt-2 text-[28px] font-semibold tracking-tight">8h 37m</p>
          <div className="mt-3 h-12">
            <BarChart values={[8,14,6,20,12,24,16]} />
          </div>
        </section>
      </main>

      <TabBar />
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[14px] font-semibold">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/50">{label}</p>
    </div>
  );
}

function MetricCard({
  title, subtitle, value, hint, chart,
}: {
  title: string;
  subtitle: string;
  value: string;
  hint?: string;
  chart?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[13px] font-medium">{title}</p>
      <p className="text-[11px] text-white/50">{subtitle}</p>
      <p className="mt-3 text-[22px] font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-white/50">{hint}</p>}
      {chart && <div className="mt-3 h-10">{chart}</div>}
    </div>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-full items-end gap-1.5">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-white/70"
          style={{ height: `${(v / max) * 100}%`, opacity: 0.35 + (v / max) * 0.65 }}
        />
      ))}
    </div>
  );
}

function LineChart({ values }: { values: number[] }) {
  const max = Math.max(...values), min = Math.min(...values);
  const w = 200, h = 40;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <polyline fill="none" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.85" />
    </svg>
  );
}