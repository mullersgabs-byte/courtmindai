import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourtMind — Train with clarity" },
      { name: "description", content: "An intelligent training system for athletes who take performance seriously. Quiet design, sharp insight." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Capabilities />
        <Method />
        <Numbers />
        <Disciplines />
        <Pricing />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b hairline bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="block h-2 w-2 rounded-full bg-foreground" />
          CourtMind
        </Link>
        <nav className="hidden items-center gap-10 text-[13px] text-muted-foreground md:flex">
          <a href="#method" className="transition hover:text-foreground">Method</a>
          <a href="#capabilities" className="transition hover:text-foreground">Capabilities</a>
          <a href="#pricing" className="transition hover:text-foreground">Membership</a>
          <a href="#disciplines" className="transition hover:text-foreground">Disciplines</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/home" className="hidden text-[13px] text-muted-foreground transition hover:text-foreground sm:inline">
            Sign in
          </Link>
          <Link
            to="/home"
            className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition hover:opacity-90"
          >
            Begin
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grain absolute inset-0 opacity-70" aria-hidden />
      <div className="mx-auto max-w-[1400px] px-8 pt-28 pb-32 md:pt-40 md:pb-48">
        <div className="animate-float-up">
          <p className="mb-10 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            <span className="block h-px w-8 bg-foreground/30" />
            Edition 01 · Athletic Intelligence
          </p>

          <h1 className="text-balance text-[14vw] font-medium leading-[0.92] tracking-[-0.045em] sm:text-[10vw] md:text-[8vw] lg:text-[7.2rem]">
            Train with <span className="font-serif italic font-normal">clarity.</span>
            <br />
            Improve with <span className="font-serif italic font-normal">intent.</span>
          </h1>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
              CourtMind is a quiet, deliberate system for athletes who measure progress in inches, not impressions. It reads your training, finds the gap, and tells you exactly what to do next.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/onboarding"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-[14px] font-medium text-background transition hover:opacity-90"
              >
                Start your assessment
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link to="/dashboard" className="text-[14px] text-foreground/70 underline-offset-4 transition hover:text-foreground hover:underline">
                Preview the system
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Marquee ---------------- */
function Marquee() {
  const words = ["Tennis", "Running", "Pilates", "Strength", "Yoga", "Soccer", "Climbing", "Swimming"];
  return (
    <section className="border-y hairline overflow-hidden py-8">
      <div className="flex gap-16 whitespace-nowrap animate-ticker text-[clamp(2rem,5vw,3.5rem)] font-serif italic font-normal tracking-tight">
        {[...words, ...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-16 text-foreground/80">
            {w}
            <span className="block h-1.5 w-1.5 rounded-full bg-foreground/30" />
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Manifesto ---------------- */
function Manifesto() {
  return (
    <section className="mx-auto max-w-[1400px] px-8 py-32 md:py-44">
      <div className="grid gap-16 lg:grid-cols-12">
        <p className="lg:col-span-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          A note on philosophy
        </p>
        <div className="lg:col-span-9">
          <p className="text-balance text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.25] tracking-tight font-light">
            We don't believe in louder apps, brighter colors, or harder pushes.
            We believe in <span className="font-serif italic font-normal">attention</span>. In the small adjustment that
            changes the next ten thousand repetitions. <span className="text-muted-foreground">CourtMind exists to make that adjustment visible.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Capabilities ---------------- */
const capabilities = [
  { n: "01", t: "Performance reading", d: "Movement, balance, timing, output — quietly evaluated after every session." },
  { n: "02", t: "Personal feedback", d: "Tailored to your discipline, level, and the way your body actually moves." },
  { n: "03", t: "Structured plan", d: "A weekly plan refined by what you did — and what you missed — last week." },
  { n: "04", t: "Continuous progress", d: "A composed view of evolution across weeks, months, and seasons." },
];

function Capabilities() {
  return (
    <section id="capabilities" className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-8 py-28">
        <div className="mb-20 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Capabilities</p>
            <h2 className="text-balance text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-[0.98] tracking-tight">
              Everything you need.<br />
              <span className="font-serif italic font-normal text-muted-foreground">Nothing you don't.</span>
            </h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-[15px] leading-relaxed text-muted-foreground">
            Four capabilities. Composed to feel like one quiet, intelligent companion.
          </p>
        </div>

        <div className="grid gap-px bg-foreground/10 sm:grid-cols-2">
          {capabilities.map((c) => (
            <div key={c.n} className="group bg-background p-10 transition hover:bg-card">
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl italic text-muted-foreground">{c.n}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
              <h3 className="mt-16 text-2xl font-medium tracking-tight">{c.t}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Method ---------------- */
const method = [
  { n: "I", t: "Assess", d: "A short, unhurried assessment of your discipline, body and goals." },
  { n: "II", t: "Capture", d: "Record or upload sessions. CourtMind reads movement and timing with quiet precision." },
  { n: "III", t: "Refine", d: "Receive structured feedback — strengths to keep, gaps to close, drills tuned to your week." },
  { n: "IV", t: "Evolve", d: "Watch performance compound across weeks. Effort, finally, made measurable." },
];

function Method() {
  return (
    <section id="method" className="border-t hairline bg-card">
      <div className="mx-auto max-w-[1400px] px-8 py-28">
        <div className="mb-24 max-w-3xl">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">The Method</p>
          <h2 className="text-balance text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-[0.98] tracking-tight">
            Four movements,<br />
            <span className="font-serif italic font-normal">one continuous practice.</span>
          </h2>
        </div>

        <ol className="divide-y hairline border-y hairline">
          {method.map((m) => (
            <li key={m.n} className="grid grid-cols-12 gap-6 py-10 transition group hover:bg-background/50">
              <span className="col-span-2 sm:col-span-1 font-serif text-2xl italic text-muted-foreground">{m.n}</span>
              <h3 className="col-span-10 sm:col-span-3 text-2xl font-medium tracking-tight">{m.t}</h3>
              <p className="col-span-12 sm:col-span-7 sm:col-start-6 text-[15px] leading-relaxed text-muted-foreground">
                {m.d}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Numbers ---------------- */
function Numbers() {
  const stats = [
    { v: "+12%", l: "Average performance gain after eight weeks" },
    { v: "94%", l: "Of members report improved consistency" },
    { v: "<3 min", l: "From session upload to structured feedback" },
  ];
  return (
    <section className="mx-auto max-w-[1400px] px-8 py-32">
      <div className="grid gap-16 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.l} className="border-t hairline pt-8">
            <p className="text-[clamp(3rem,6vw,5.5rem)] font-medium leading-none tracking-tight">{s.v}</p>
            <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Disciplines ---------------- */
const disciplines = [
  "Tennis", "Running", "Strength", "Pilates", "Yoga", "Soccer", "Climbing", "Swimming",
];

function Disciplines() {
  return (
    <section id="disciplines" className="border-y hairline">
      <div className="mx-auto max-w-[1400px] px-8 py-28">
        <div className="mb-16 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Disciplines</p>
            <h2 className="text-balance text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-[0.98] tracking-tight">
              One system.<br />
              <span className="font-serif italic font-normal">Many practices.</span>
            </h2>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-[15px] leading-relaxed text-muted-foreground">
            Metrics, drills and feedback adapt to the discipline you actually train.
          </p>
        </div>

        <ul className="divide-y hairline border-y hairline">
          {disciplines.map((d, i) => (
            <li key={d} className="group grid grid-cols-12 items-center gap-6 py-7 transition hover:px-6">
              <span className="col-span-1 font-serif text-lg italic text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="col-span-9 text-[clamp(1.6rem,3vw,2.5rem)] font-medium tracking-tight">{d}</span>
              <span className="col-span-2 justify-self-end text-muted-foreground transition group-hover:text-foreground">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
const tiers = [
  { name: "Essential", price: "Free", note: "Try the system", features: ["3 sessions / month", "Performance score", "One discipline"], featured: false },
  { name: "Member", price: "$24", note: "Per month", features: ["Unlimited sessions", "Structured weekly plan", "Full feedback", "All disciplines", "Progress archive"], featured: true },
  { name: "Atelier", price: "$120", note: "Per month", features: ["Everything in Member", "Human coach review", "Custom drill library", "Quarterly strategy call", "Priority support"], featured: false },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1400px] px-8 py-32">
      <div className="mx-auto mb-20 max-w-3xl text-center">
        <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Membership</p>
        <h2 className="text-balance text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-[0.98] tracking-tight">
          A quiet investment in <span className="font-serif italic font-normal">how you train.</span>
        </h2>
      </div>

      <div className="grid gap-px bg-foreground/10 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col p-10 transition ${
              t.featured ? "bg-foreground text-background" : "bg-background"
            }`}
          >
            {t.featured && (
              <span className="absolute right-10 top-10 text-[10px] font-medium uppercase tracking-[0.24em] text-background/60">
                Recommended
              </span>
            )}
            <p className={`text-[11px] font-medium uppercase tracking-[0.24em] ${t.featured ? "text-background/60" : "text-muted-foreground"}`}>
              {t.name}
            </p>
            <div className="mt-12 flex items-baseline gap-3">
              <p className="text-6xl font-medium tracking-tight">{t.price}</p>
              <p className={`text-[13px] ${t.featured ? "text-background/60" : "text-muted-foreground"}`}>
                {t.note}
              </p>
            </div>
            <ul className={`mt-12 space-y-3 text-[14px] ${t.featured ? "text-background/85" : "text-foreground/80"}`}>
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className={`mt-2 block h-px w-4 ${t.featured ? "bg-background/40" : "bg-foreground/30"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/onboarding"
              className={`mt-12 inline-flex items-center justify-between rounded-full px-5 py-3.5 text-[13px] font-medium transition ${
                t.featured
                  ? "bg-background text-foreground hover:opacity-90"
                  : "border hairline hover:bg-card"
              }`}
            >
              Begin
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Closing ---------------- */
function Closing() {
  return (
    <section className="mx-auto max-w-[1400px] px-8 pb-32">
      <div className="border-t hairline pt-20">
        <h2 className="text-balance text-[clamp(2.5rem,7vw,7rem)] font-medium leading-[0.95] tracking-[-0.04em]">
          Stop guessing.<br />
          <span className="font-serif italic font-normal">Start improving.</span>
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Link
            to="/onboarding"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-[14px] font-medium text-background transition hover:opacity-90"
          >
            Start your assessment
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <p className="text-[13px] text-muted-foreground">No credit card. Two minutes.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-8 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span className="block h-2 w-2 rounded-full bg-foreground" />
            CourtMind
          </div>
          <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            An intelligent training system for athletes who take performance seriously.
          </p>
        </div>

        <FooterCol title="System" links={["Method", "Capabilities", "Disciplines", "Membership"]} />
        <FooterCol title="Company" links={["About", "Journal", "Contact", "Press"]} />
        <FooterCol title="Legal" links={["Privacy", "Terms", "Cookies"]} />
      </div>

      <div className="border-t hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-6 text-[12px] text-muted-foreground">
          <p>© {new Date().getFullYear()} CourtMind. All rights reserved.</p>
          <p className="font-serif italic">Train with clarity.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="md:col-span-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{title}</p>
      <ul className="mt-6 space-y-3 text-[13px]">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-foreground/80 transition hover:text-foreground">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
