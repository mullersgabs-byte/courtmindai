import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Target, TrendingUp, Layers, Repeat, Check, Star } from "lucide-react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { AppScreenHome } from "@/components/AppScreenHome";
import { AppScreenStats } from "@/components/AppScreenStats";

export const Route = createFileRoute("/")({
  component: Index,
});

const sports = [
  { name: "Tennis", emoji: "🎾" },
  { name: "Gym", emoji: "💪" },
  { name: "Running", emoji: "🏃" },
  { name: "Soccer", emoji: "⚽" },
  { name: "Basketball", emoji: "🏀" },
  { name: "Volleyball", emoji: "🏐" },
];

const features = [
  { icon: Sparkles, title: "Smart Performance Analysis", desc: "Evaluate technique, balance, and training quality with AI precision." },
  { icon: Target, title: "Personalized Feedback", desc: "Tailored insights based on your level, goals and chosen sport." },
  { icon: TrendingUp, title: "Structured Improvement", desc: "Clear, prioritized recommendations to evolve faster every week." },
  { icon: Layers, title: "Optimized Training Plan", desc: "Your workout — refined, balanced, and consistently more efficient." },
  { icon: Repeat, title: "Progress Tracking", desc: "Levels, visual evolution and daily streaks that keep you accountable." },
  { icon: Star, title: "Multi-Sport Engine", desc: "One platform adapting metrics, drills and strategy to your discipline." },
];

const steps = [
  { n: "01", title: "Record or upload", desc: "Capture your session — phone, camera, anything." },
  { n: "02", title: "AI analyzes", desc: "CourtMind reads movement, timing and quality." },
  { n: "03", title: "Structured feedback", desc: "Strengths, gaps, and what to fix first." },
  { n: "04", title: "Optimize plan", desc: "Get drills tuned to your weak points." },
  { n: "05", title: "Track evolution", desc: "Watch your score and consistency rise." },
];

const tiers = [
  { name: "Free", price: "$0", tag: "Start", features: ["3 analyses / month", "Basic feedback", "1 sport"], featured: false },
  { name: "Pro", price: "$14", tag: "Most popular", features: ["Unlimited analyses", "Advanced feedback", "Personalized plan", "All sports"], featured: true },
  { name: "Elite", price: "$49", tag: "Athlete", features: ["AI + human coaching", "Full strategy review", "Priority support", "Custom drills"], featured: false },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <SportsSection />
      <HowItWorks />
      <FeaturesSection />
      <ShowcaseSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">CourtMind</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#how" className="transition hover:text-foreground">How it works</a>
          <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#" className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline">Log in</a>
          <a href="#" className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90">
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grain absolute inset-0 opacity-60" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8">
        <div className="animate-float-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Intelligent training, designed for athletes
          </div>
          <h1 className="mt-6 text-balance text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Train Smarter.<br />
            <span className="italic font-light">Improve</span> Faster.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            CourtMind transforms your training into clear, actionable insights — so you stop guessing and start improving.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition hover:opacity-90">
              Get started <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#how" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold transition hover:bg-secondary">
              How it works
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => <div key={i} className="h-8 w-8 rounded-full bg-secondary ring-2 ring-background" />)}
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex gap-0.5 text-amber-500">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-3 w-3 fill-current" />)}</div>
              Trusted by <span className="font-semibold text-foreground">12,400+</span> athletes
            </div>
          </div>
        </div>

        {/* Phone composition */}
        <div className="relative mx-auto flex h-[560px] w-full max-w-lg items-center justify-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40 blur-3xl" />
          </div>
          <div className="relative -mr-12 translate-y-6 rotate-[-6deg] sm:-mr-20">
            <PhoneMockup>
              <AppScreenHome />
            </PhoneMockup>
          </div>
          <div className="relative -ml-12 -translate-y-6 rotate-[6deg] sm:-ml-20">
            <PhoneMockup>
              <AppScreenStats />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}

function SportsSection() {
  return (
    <section className="border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Multi-sport</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Choose your sport.<br/><span className="text-muted-foreground">We adapt everything.</span></h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Metrics, feedback and drills are tuned to the discipline you actually train.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {sports.map((s) => (
            <button
              key={s.name}
              className="group relative aspect-square rounded-3xl border border-border bg-card p-4 text-left transition hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg"
            >
              <span className="text-3xl">{s.emoji}</span>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-sm font-semibold">{s.name}</span>
                <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
        <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">From training session to measurable progress — in five steps.</h2>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`group relative rounded-3xl border border-border p-6 transition hover:-translate-y-1 ${i === 1 ? "bg-accent text-accent-foreground" : "bg-card"}`}
          >
            <span className={`text-xs font-mono font-semibold ${i===1 ? "opacity-70" : "text-muted-foreground"}`}>{s.n}</span>
            <h3 className="mt-8 text-base font-bold leading-snug">{s.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${i===1 ? "opacity-80" : "text-muted-foreground"}`}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Features</p>
            <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">Built for athletes who take performance seriously.</h2>
          </div>
          <p className="text-base text-muted-foreground lg:text-lg">
            CourtMind is not just an app — it's a system. Every feature is designed to translate effort into measurable, structured improvement.
          </p>
        </div>

        <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-3xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary transition group-hover:bg-accent">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-accent/30 blur-3xl" />
          <div className="rotate-[-3deg]">
            <PhoneMockup>
              <AppScreenStats />
            </PhoneMockup>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Result</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">A score. A direction. A plan.</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every session ends with a clear performance score and structured feedback — strengths to keep, gaps to fix, and the drills that close them.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <ScoreCard label="Performance" value="82" suffix="/100" />
            <ScoreCard label="Consistency" value="94" suffix="%" highlight />
            <ScoreCard label="Streak" value="6" suffix="days" />
          </div>

          <ul className="mt-8 space-y-3">
            {[
              "Strengths: movement, baseline consistency",
              "Improve: positioning, reaction time",
              "Recommended drills auto-generated weekly",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-foreground/80">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ScoreCard({ label, value, suffix, highlight }: { label: string; value: string; suffix: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border p-4 ${highlight ? "bg-accent text-accent-foreground" : "bg-card"}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${highlight ? "opacity-70" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">
        {value}<span className="ml-1 text-sm font-normal opacity-70">{suffix}</span>
      </p>
    </div>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-5xl">Choose the level of intelligence you want.</h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-3xl border p-8 transition ${
                t.featured
                  ? "border-foreground bg-foreground text-background shadow-2xl md:-translate-y-3"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{t.name}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${t.featured ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>{t.tag}</span>
              </div>
              <p className="mt-6 text-5xl font-bold tracking-tight">{t.price}<span className={`text-sm font-normal ${t.featured ? "opacity-70" : "text-muted-foreground"}`}>/mo</span></p>
              <ul className="mt-8 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className={`h-4 w-4 ${t.featured ? "text-accent" : "text-foreground"}`} />
                    <span className={t.featured ? "opacity-90" : "text-foreground/80"}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  t.featured ? "bg-accent text-accent-foreground hover:opacity-90" : "border border-border bg-card hover:bg-secondary"
                }`}
              >
                Get {t.name} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground px-8 py-20 text-background sm:px-16">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" aria-hidden />
        <div className="relative max-w-2xl">
          <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Stop guessing.<br />Start <span className="italic font-light">improving.</span>
          </h2>
          <p className="mt-6 text-base text-background/70 sm:text-lg">
            Your training, understood. Join thousands of athletes building real, measurable progress with CourtMind.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
              Get started — free <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#" className="inline-flex items-center gap-2 rounded-full border border-background/20 px-6 py-3.5 text-sm font-semibold text-background transition hover:bg-background/10">
              Continue with Google
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-foreground text-background">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold">CourtMind</span>
          <span className="text-sm text-muted-foreground">— Train with clarity.</span>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CourtMind. All rights reserved.</p>
      </div>
    </footer>
  );
}
