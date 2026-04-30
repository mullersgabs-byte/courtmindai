import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Begin — CourtMind" }] }),
  component: Onboarding,
});

const sports = ["Tennis", "Strength", "Running", "Pilates", "Yoga", "Soccer"];
const levels = [
  { k: "Beginner", d: "Building a base." },
  { k: "Intermediate", d: "Training with intent." },
  { k: "Advanced", d: "Refining the details." },
];
const frequencies = ["2", "3", "4", "5", "6"];
const goals = [
  { k: "Performance", d: "Compete with intention." },
  { k: "Aesthetics", d: "Look as composed as you train." },
  { k: "Health", d: "A long, steady practice." },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ sport: "", level: "", frequency: "", goal: "" });
  const navigate = useNavigate();

  const steps = [
    { key: "sport", label: "Discipline", question: "What do you train?" },
    { key: "level", label: "Level", question: "Where are you now?" },
    { key: "frequency", label: "Cadence", question: "How often, per week?" },
    { key: "goal", label: "Intent", question: "What are you working toward?" },
  ] as const;

  const current = steps[step];
  const value = data[current.key];
  const canContinue = !!value;

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Top bar */}
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5">
          <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span className="block h-2 w-2 rounded-full bg-foreground" />
            CourtMind
          </Link>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Assessment · {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </p>
          <Link to="/" className="text-[13px] text-muted-foreground transition hover:text-foreground">
            Save & exit
          </Link>
        </div>
        {/* Progress hairline */}
        <div className="h-px w-full bg-foreground/5">
          <div
            className="h-px bg-foreground transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1100px] px-8 py-16 md:py-24">
        <div key={step} className="animate-float-up">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {current.label}
          </p>
          <h1 className="mt-6 text-balance text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[1] tracking-[-0.04em]">
            {current.question.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="font-serif italic font-normal">{current.question.split(" ").slice(-1)}</span>
          </h1>

          <div className="mt-16">
            {current.key === "sport" && (
              <div className="grid grid-cols-2 gap-px bg-foreground/10 sm:grid-cols-3">
                {sports.map((s) => (
                  <Choice key={s} active={data.sport === s} onClick={() => setData({ ...data, sport: s })} large>
                    {s}
                  </Choice>
                ))}
              </div>
            )}

            {current.key === "level" && (
              <div className="grid gap-px bg-foreground/10 md:grid-cols-3">
                {levels.map((l) => (
                  <Choice
                    key={l.k}
                    active={data.level === l.k}
                    onClick={() => setData({ ...data, level: l.k })}
                    description={l.d}
                  >
                    {l.k}
                  </Choice>
                ))}
              </div>
            )}

            {current.key === "frequency" && (
              <div className="grid grid-cols-5 gap-px bg-foreground/10">
                {frequencies.map((f) => (
                  <Choice
                    key={f}
                    active={data.frequency === f}
                    onClick={() => setData({ ...data, frequency: f })}
                    centered
                  >
                    <span className="block text-5xl font-medium tracking-tight">{f}</span>
                    <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      per week
                    </span>
                  </Choice>
                ))}
              </div>
            )}

            {current.key === "goal" && (
              <div className="grid gap-px bg-foreground/10 md:grid-cols-3">
                {goals.map((g) => (
                  <Choice
                    key={g.k}
                    active={data.goal === g.k}
                    onClick={() => setData({ ...data, goal: g.k })}
                    description={g.d}
                  >
                    {g.k}
                  </Choice>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer nav */}
      <footer className="fixed inset-x-0 bottom-0 border-t hairline bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-8 py-5">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === step ? "w-8 bg-foreground" : i < step ? "w-2 bg-foreground/60" : "w-2 bg-foreground/15"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={!canContinue}
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-medium text-background transition hover:opacity-90 disabled:opacity-30"
          >
            {step === steps.length - 1 ? "Enter system" : "Continue"}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function Choice({
  children,
  active,
  onClick,
  description,
  large,
  centered,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  description?: string;
  large?: boolean;
  centered?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col bg-background p-8 text-left transition ${
        centered ? "items-center text-center" : ""
      } ${active ? "bg-card" : "hover:bg-card/60"}`}
    >
      <span
        className={`block ${large ? "text-3xl md:text-4xl" : "text-2xl"} font-medium tracking-tight transition`}
      >
        {children}
      </span>
      {description && (
        <span className="mt-2 text-[13px] text-muted-foreground">{description}</span>
      )}
      <span
        className={`absolute right-6 top-6 grid h-6 w-6 place-items-center rounded-full border transition ${
          active ? "border-foreground bg-foreground text-background" : "hairline text-transparent"
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
