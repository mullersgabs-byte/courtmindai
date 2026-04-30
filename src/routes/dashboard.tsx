import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, Play } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Today — CourtMind" }] }),
  component: Dashboard,
});

function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b hairline bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5">
          <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span className="block h-2 w-2 rounded-full bg-foreground" />
            CourtMind
          </Link>
          <nav className="hidden items-center gap-10 text-[13px] text-muted-foreground md:flex">
            <a className="text-foreground" href="#">Today</a>
            <a className="transition hover:text-foreground" href="#">Plan</a>
            <a className="transition hover:text-foreground" href="#">Sessions</a>
            <a className="transition hover:text-foreground" href="#">Archive</a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-[12px] text-muted-foreground sm:inline">{today}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-[12px] font-medium text-background">
              S
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-8 pb-32">
        {/* Greeting */}
        <section className="border-b hairline py-16 md:py-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Good morning
          </p>
          <h1 className="mt-6 text-balance text-[clamp(2.6rem,6vw,5.5rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Sofia, today is for <span className="font-serif italic font-normal">precision.</span>
          </h1>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Your last session showed measurable improvement in baseline consistency.
              Today's plan deepens that gain — without overreaching.
            </p>
            <button className="group inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-4 text-[14px] font-medium text-background transition hover:opacity-90">
              <Play className="h-4 w-4 fill-background" />
              Start training
            </button>
          </div>
        </section>

        {/* Stats trio */}
        <section className="grid gap-px bg-foreground/10 md:grid-cols-3 border-b hairline">
          <Stat
            label="Performance"
            value="82"
            unit="/ 100"
            delta="+12% this month"
            chart={<MiniLine values={[40, 48, 44, 52, 60, 58, 70, 74, 82]} />}
          />
          <Stat
            label="Evolution"
            value="6"
            unit="weeks"
            delta="Steady upward trend"
            chart={<MiniBars values={[30, 45, 38, 60, 52, 75]} />}
          />
          <Stat
            label="Consistency"
            value="94"
            unit="%"
            delta="14-day streak"
            chart={<MiniDots count={14} active={12} />}
          />
        </section>

        {/* Today plan + Insight */}
        <section className="grid gap-px bg-foreground/10 lg:grid-cols-3 border-b hairline">
          <div className="bg-background p-10 lg:col-span-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Today's plan · Tennis · 1h 10m
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-tight">Baseline rhythm & footwork</h2>

            <ul className="mt-10 divide-y hairline border-y hairline">
              {[
                { n: "I", t: "Warm-up", d: "Mobility, dynamic stretch", m: "10 min" },
                { n: "II", t: "Footwork ladder", d: "Lateral, split-step, recovery", m: "15 min" },
                { n: "III", t: "Crosscourt rally", d: "20-ball sets, controlled depth", m: "30 min" },
                { n: "IV", t: "Serve placement", d: "Wide / T / body — 3 rounds", m: "15 min" },
              ].map((b) => (
                <li key={b.n} className="grid grid-cols-12 items-center gap-4 py-5">
                  <span className="col-span-1 font-serif text-xl italic text-muted-foreground">{b.n}</span>
                  <div className="col-span-7">
                    <p className="text-[15px] font-medium">{b.t}</p>
                    <p className="text-[13px] text-muted-foreground">{b.d}</p>
                  </div>
                  <p className="col-span-3 text-right text-[13px] text-muted-foreground sm:col-span-3">{b.m}</p>
                  <ArrowUpRight className="col-span-1 ml-auto h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-foreground p-10 text-background">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-background/60">
              Insight
            </p>
            <p className="mt-6 text-balance text-[clamp(1.4rem,2vw,1.75rem)] leading-snug tracking-tight font-light">
              Your <span className="font-serif italic">positioning</span> improved
              <span className="font-serif italic"> +12%</span> over the last two weeks.
              Hold cadence — don't add load yet.
            </p>
            <div className="mt-12 border-t border-background/15 pt-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-background/60">Suggested focus</p>
              <ul className="mt-4 space-y-2 text-[14px] text-background/85">
                <li>· Reaction time</li>
                <li>· Recovery between points</li>
                <li>· Second serve depth</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Recent sessions */}
        <section className="py-16">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Recent sessions
              </p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight">
                A composed view of <span className="font-serif italic">the last week.</span>
              </h2>
            </div>
            <a href="#" className="hidden text-[13px] text-muted-foreground transition hover:text-foreground sm:inline">
              View archive →
            </a>
          </div>

          <ul className="divide-y hairline border-y hairline">
            {[
              { d: "Tue", date: "Apr 28", t: "Crosscourt rally", score: 78, dur: "58 min" },
              { d: "Sun", date: "Apr 26", t: "Serve placement", score: 81, dur: "42 min" },
              { d: "Fri", date: "Apr 24", t: "Footwork ladder", score: 74, dur: "35 min" },
              { d: "Wed", date: "Apr 22", t: "Match simulation", score: 70, dur: "1h 12m" },
            ].map((s) => (
              <li key={s.date} className="grid grid-cols-12 items-center gap-4 py-6 transition hover:px-2">
                <div className="col-span-2 sm:col-span-1">
                  <p className="font-serif text-xl italic">{s.d}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{s.date}</p>
                </div>
                <p className="col-span-7 sm:col-span-6 text-[16px] font-medium tracking-tight">{s.t}</p>
                <p className="col-span-3 sm:col-span-2 text-right text-[13px] text-muted-foreground">{s.dur}</p>
                <p className="col-span-12 sm:col-span-2 sm:text-right">
                  <span className="font-serif text-2xl italic">{s.score}</span>
                  <span className="ml-1 text-[12px] text-muted-foreground">/100</span>
                </p>
                <ArrowUpRight className="hidden h-4 w-4 text-muted-foreground sm:col-span-1 sm:ml-auto sm:block" />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

/* ---------- Stat card ---------- */
function Stat({
  label,
  value,
  unit,
  delta,
  chart,
}: {
  label: string;
  value: string;
  unit: string;
  delta: string;
  chart: React.ReactNode;
}) {
  return (
    <div className="bg-background p-10">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </p>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-12 flex items-baseline gap-2">
        <p className="text-7xl font-medium tracking-[-0.04em] leading-none">{value}</p>
        <p className="text-[13px] text-muted-foreground">{unit}</p>
      </div>
      <p className="mt-4 text-[12px] text-muted-foreground">{delta}</p>
      <div className="mt-10 h-16">{chart}</div>
    </div>
  );
}

/* ---------- Mini charts ---------- */
function MiniLine({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 280;
  const h = 60;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-foreground"
      />
      <circle cx={w} cy={h - ((values[values.length - 1] - min) / (max - min || 1)) * h} r="3" className="fill-foreground" />
    </svg>
  );
}

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-full items-end gap-1.5">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${i === values.length - 1 ? "bg-foreground" : "bg-foreground/20"}`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function MiniDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex h-full items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i < active ? "bg-foreground" : "bg-foreground/15"}`}
        />
      ))}
    </div>
  );
}
