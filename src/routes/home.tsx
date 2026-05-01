import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, ChevronRight, Flame, Timer, Activity, Sparkles, Upload } from "lucide-react";
import heroAthlete from "@/assets/hero-athlete.jpg";
import sportTennis from "@/assets/sport-tennis.jpg";
import sportGym from "@/assets/sport-gym.jpg";
import sportRunning from "@/assets/sport-running.jpg";
import sportFootball from "@/assets/sport-football.jpg";
import train1 from "@/assets/train-1.jpg";
import train2 from "@/assets/train-2.jpg";
import train3 from "@/assets/train-3.jpg";
import train4 from "@/assets/train-4.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — CourtMind Elite" },
      { name: "description", content: "Your personal training home. Today's session, programs and progress." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [greeting, setGreeting] = useState("Good evening");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span className="block h-2 w-2 rounded-full bg-court animate-pulse-court" />
            CourtMind
          </Link>
          <nav className="hidden items-center gap-10 text-[13px] text-muted-foreground md:flex">
            <Link to="/home" className="text-foreground">Home</Link>
            <Link to="/training" className="transition hover:text-foreground">Training</Link>
            <Link to="/analyze" className="transition hover:text-foreground">Analyze</Link>
            <Link to="/plan" className="transition hover:text-foreground">Plan</Link>
            <Link to="/history" className="transition hover:text-foreground">Archive</Link>
            <Link to="/profile" className="transition hover:text-foreground">Profile</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Avatar />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-32 sm:px-8">
        {/* Greeting + user header */}
        <section className="pt-10 pb-12 sm:pt-16">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute -inset-0.5 rounded-full court-gradient opacity-60 blur-md" aria-hidden />
              <span className="relative grid h-12 w-12 place-items-center rounded-full bg-foreground text-[14px] font-medium text-background ring-1 ring-court/40">
                S
              </span>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {greeting}
              </p>
              <p className="text-[15px] text-foreground">Sofia Martins</p>
            </div>
          </div>

          <h1 className="mt-10 text-balance text-[clamp(2.2rem,6vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Today is for <span className="font-serif italic font-normal text-court-gradient">precision.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            A focused tennis session is queued. Your last analysis showed cleaner footwork — let's keep that line.
          </p>
        </section>

        {/* Today's training — hero card */}
        <section className="pb-16">
          <SectionLabel>Today's training</SectionLabel>
          <div className="group relative mt-5 overflow-hidden rounded-3xl border hairline bg-card transition hover:glow-court">
            <div className="grid lg:grid-cols-[1.2fr_1fr]">
              <div className="relative aspect-[4/3] lg:aspect-auto">
                <img
                  src={heroAthlete}
                  alt="Athlete training session"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-court animate-pulse-court" /> Live plan
                </div>
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <button className="grid h-14 w-14 place-items-center rounded-full bg-court text-ink shadow-lg glow-court transition hover:scale-105">
                    <Play className="h-5 w-5 fill-ink" />
                  </button>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.2em] text-foreground/70">Tennis · 1h 10m</p>
                    <p className="mt-0.5 text-[18px] font-medium tracking-tight">Baseline rhythm & footwork</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-7 sm:p-9">
                <div>
                  <ul className="divide-y hairline">
                    {[
                      { i: <Flame className="h-4 w-4" />, t: "Warm-up", d: "Mobility · 10 min" },
                      { i: <Activity className="h-4 w-4" />, t: "Footwork ladder", d: "Lateral · 15 min" },
                      { i: <Timer className="h-4 w-4" />, t: "Crosscourt rally", d: "20-ball sets · 30 min" },
                      { i: <Sparkles className="h-4 w-4" />, t: "Serve placement", d: "Wide / T / body · 15 min" },
                    ].map((b) => (
                      <li key={b.t} className="flex items-center gap-4 py-3.5">
                        <span className="grid h-9 w-9 place-items-center rounded-full border hairline text-court">
                          {b.i}
                        </span>
                        <div className="flex-1">
                          <p className="text-[14px] font-medium">{b.t}</p>
                          <p className="text-[12px] text-muted-foreground">{b.d}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7">
                  <ProgressLine value={42} label="Plan completion" />
                  <Link
                    to="/analyze"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-court px-5 py-3.5 text-[14px] font-medium text-ink transition hover:opacity-90 glow-court-soft"
                  >
                    <Play className="h-4 w-4 fill-ink" /> Start training
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Continue where you left off */}
        <section className="pb-16">
          <div className="flex items-end justify-between">
            <SectionLabel>Continue where you left off</SectionLabel>
            <a href="#" className="text-[12px] text-muted-foreground transition hover:text-foreground">View all →</a>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { img: train1, t: "Crosscourt depth", d: "Tennis · 12 min left", p: 64 },
              { img: train2, t: "Hip mobility flow", d: "Recovery · 6 min left", p: 80 },
              { img: train3, t: "Sprint intervals", d: "Running · 18 min left", p: 32 },
            ].map((c) => (
              <ContinueCard key={c.t} {...c} />
            ))}
          </div>
        </section>

        {/* Recommended programs */}
        <section className="pb-16">
          <div className="flex items-end justify-between">
            <SectionLabel>Recommended programs</SectionLabel>
            <a href="#" className="text-[12px] text-muted-foreground transition hover:text-foreground">Explore →</a>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProgramCard img={sportTennis} tag="Tennis" t="Elite Baseline" w="6 weeks" />
            <ProgramCard img={sportGym} tag="Strength" t="Athletic Power" w="8 weeks" />
            <ProgramCard img={sportRunning} tag="Running" t="VO2 Foundation" w="4 weeks" />
            <ProgramCard img={sportFootball} tag="Football" t="Explosive Agility" w="5 weeks" />
          </div>
        </section>

        {/* Inspiration / aesthetic grid */}
        <section className="pb-20">
          <SectionLabel>From the journal</SectionLabel>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AestheticCard img={train4} title="The art of the warm-up" meta="Read · 4 min" />
            <AestheticCard img={train2} title="Recovery, redefined" meta="Read · 6 min" />
            <AestheticCard img={train3} title="Why slow runs win" meta="Read · 5 min" />
          </div>
        </section>

        {/* CTA to analyze */}
        <section className="pb-10">
          <div className="overflow-hidden rounded-3xl border hairline glass p-8 sm:p-12">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">AI Analysis</p>
                <h3 className="mt-3 text-balance text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-tight tracking-tight">
                  Send a video. Receive <span className="font-serif italic text-court-gradient">precision.</span>
                </h3>
              </div>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 rounded-full bg-court px-6 py-3.5 text-[14px] font-medium text-ink transition hover:opacity-90 glow-court"
              >
                <Upload className="h-4 w-4" /> Send training
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- pieces ---------- */
function Avatar() {
  return (
    <div className="relative">
      <span className="absolute -inset-0.5 rounded-full court-gradient opacity-50 blur-sm" aria-hidden />
      <span className="relative grid h-9 w-9 place-items-center rounded-full bg-foreground text-[12px] font-medium text-background ring-1 ring-court/40">
        S
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
      {children}
    </p>
  );
}

function ProgressLine({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="text-[12px] text-foreground">{value}%</p>
      </div>
      <div className="mt-2 h-px w-full bg-foreground/10">
        <div
          className="h-px bg-court glow-court-soft"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ContinueCard({ img, t, d, p }: { img: string; t: string; d: string; p: number }) {
  return (
    <a
      href="#"
      className="group relative block overflow-hidden rounded-2xl border hairline bg-card transition hover:glow-court"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img src={img} alt={t} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full glass text-foreground transition group-hover:bg-court group-hover:text-ink">
          <Play className="h-4 w-4" />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/70">{d}</p>
          <p className="mt-1 text-[16px] font-medium tracking-tight">{t}</p>
          <div className="mt-3 h-px w-full bg-foreground/15">
            <div className="h-px bg-court glow-court-soft" style={{ width: `${p}%` }} />
          </div>
        </div>
      </div>
    </a>
  );
}

function ProgramCard({ img, tag, t, w }: { img: string; tag: string; t: string; w: string }) {
  return (
    <a
      href="#"
      className="group relative block overflow-hidden rounded-2xl border hairline bg-card transition hover:-translate-y-0.5 hover:glow-court"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img src={img} alt={t} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full glass px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground">
          {tag}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[15px] font-medium tracking-tight">{t}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{w}</p>
        </div>
      </div>
    </a>
  );
}

function AestheticCard({ img, title, meta }: { img: string; title: string; meta: string }) {
  return (
    <a href="#" className="group block overflow-hidden rounded-2xl border hairline bg-card transition hover:glow-court">
      <div className="relative aspect-[5/4] overflow-hidden">
        <img src={img} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{meta}</p>
        <p className="mt-2 text-[16px] font-medium tracking-tight">{title}</p>
      </div>
    </a>
  );
}