import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — CourtMind Elite" },
      { name: "description", content: "Set up your athletic profile in under a minute." },
    ],
  }),
  component: OnboardingPage,
});

const SPORTS = [
  "Tennis",
  "Volleyball",
  "Beach Volleyball",
  "Padel",
  "Basketball",
  "Football",
  "Running",
  "Cycling",
  "Swimming",
  "Strength",
  "CrossFit",
  "Pilates",
  "Yoga",
  "Boxing",
  "MMA",
  "Climbing",
  "Surf",
  "Skate",
  "Golf",
  "Triathlon",
];
const LEVELS: Array<{ id: "beginner"|"intermediate"|"advanced"; label: string; sub: string; detail: string }> = [
  { id: "beginner",     label: "Beginner",     sub: "Building the base",  detail: "New to structured training. We'll start gently and grow your capacity week by week." },
  { id: "intermediate", label: "Intermediate", sub: "Refining your form", detail: "You train consistently. We'll sharpen technique, balance load, and close specific gaps." },
  { id: "advanced",     label: "Advanced",     sub: "Chasing peak",       detail: "You've built a strong base. We'll push intensity, periodisation and fine biomechanics." },
];
const GOALS = ["Improve technique", "Get stronger", "Lose body fat", "Compete", "Stay consistent", "Recover from injury"];

type Profile = {
  sport: string;
  level: "beginner" | "intermediate" | "advanced" | null;
  goal: string;
};

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>({ sport: "Tennis", level: null, goal: "" });

  const total = 3;
  const canNext =
    (step === 0 && !!profile.sport) ||
    (step === 1 && !!profile.level) ||
    (step === 2 && !!profile.goal);

  const next = () => {
    if (!canNext) return;
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    try {
      localStorage.setItem("courtmind.profile", JSON.stringify(profile));
    } catch {}
    navigate({ to: "/plan" });
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
             Exit
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">
            Step {step + 1} <span className="text-foreground/30">/ {total}</span>
          </p>
          <div className="w-12" />
        </div>
        {/* progress */}
        <div className="mx-auto max-w-[1100px] px-5 pb-3 sm:px-8">
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-court glow-court" : "bg-foreground/10"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 pb-32 pt-12 sm:px-8 sm:pt-20">
        <div key={step} className="animate-float-up">
          {step === 0 && (
            <SportStep
              value={profile.sport}
              onChange={(sport) => setProfile((p) => ({ ...p, sport }))}
            />
          )}
          {step === 1 && (
            <LevelStep
              value={profile.level}
              onChange={(level) => setProfile((p) => ({ ...p, level }))}
            />
          )}
          {step === 2 && (
            <GoalStep
              value={profile.goal}
              onChange={(goal) => setProfile((p) => ({ ...p, goal }))}
            />
          )}
        </div>

        {/* footer nav */}
        <div className="mt-16 flex items-center justify-between gap-4 border-t hairline pt-8">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full border hairline px-5 py-3 text-[13px] text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
             Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className={`group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-medium transition ${
              canNext
                ? "bg-court text-background glow-court hover:opacity-95"
                : "bg-foreground/10 text-muted-foreground cursor-not-allowed"
            }`}
          >
            {step === total - 1 ? "Generate my plan" : "Continue"}
            
          </button>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Step 1: Sport ---------------- */
function SportStep({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <section>
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">
         Discipline
      </p>
      <h1 className="mt-5 text-balance text-[clamp(2rem,5.5vw,3.8rem)] font-medium leading-[0.98] tracking-[-0.04em]">
        What do you <span className="font-serif italic font-normal text-court-gradient">train?</span>
      </h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Pick the sport you practise most. Your plan, drills and feedback will adapt to it.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SPORTS.map((s) => {
          const active = value === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`group relative overflow-hidden rounded-2xl border px-4 py-6 text-left transition ${
                active
                  ? "border-court bg-court/10 glow-court"
                  : "hairline bg-card/40 hover:bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[15px] font-medium tracking-tight ${active ? "text-court" : "text-foreground"}`}>
                  {s}
                </span>
                {active && <span className="text-court">✓</span>}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Step 2: Level ---------------- */
function LevelStep({
  value,
  onChange,
}: {
  value: Profile["level"];
  onChange: (l: Profile["level"]) => void;
}) {
  return (
    <section>
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">
         Level
      </p>
      <h1 className="mt-5 text-balance text-[clamp(2rem,5.5vw,3.8rem)] font-medium leading-[0.98] tracking-[-0.04em]">
        Where are you <span className="font-serif italic font-normal text-court-gradient">today?</span>
      </h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Be honest. We'll calibrate intensity, volume and complexity to match.
      </p>

      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        {LEVELS.map((l) => {
          const active = value === l.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onChange(l.id)}
              className={`group relative flex h-full flex-col rounded-2xl border p-6 text-left transition ${
                active
                  ? "border-court bg-court/10 glow-court"
                  : "hairline bg-card/40 hover:bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  {l.sub}
                </span>
                {active && <span className="text-court">✓</span>}
              </div>
              <p className={`mt-6 text-2xl font-medium tracking-tight ${active ? "text-court" : "text-foreground"}`}>
                {l.label}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{l.detail}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Step 3: Goal ---------------- */
function GoalStep({ value, onChange }: { value: string; onChange: (g: string) => void }) {
  return (
    <section>
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-court">
         Intent
      </p>
      <h1 className="mt-5 text-balance text-[clamp(2rem,5.5vw,3.8rem)] font-medium leading-[0.98] tracking-[-0.04em]">
        What's the <span className="font-serif italic font-normal text-court-gradient">goal?</span>
      </h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Pick one. We'll bias your plan towards it without losing the rest.
      </p>

      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GOALS.map((g) => {
          const active = value === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => onChange(g)}
              className={`group flex items-center justify-between rounded-2xl border px-5 py-5 text-left transition ${
                active
                  ? "border-court bg-court/10 glow-court"
                  : "hairline bg-card/40 hover:bg-card"
              }`}
            >
              <span className={`text-[15px] font-medium tracking-tight ${active ? "text-court" : "text-foreground"}`}>
                {g}
              </span>
              {active && <span className="text-court">✓</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}