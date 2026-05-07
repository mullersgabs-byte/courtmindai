import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { saveProfile } from "@/lib/profile";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Setup — Traino" }] }),
  component: OnboardingPage,
});

const SPORTS = ["Basketball","Soccer","Volleyball","Gym","Running","Tennis","Cycling","Swimming"];
const DIFFICULTIES = ["Consistency","Technique","Endurance","Strength","Mobility","Recovery"];
const GOALS = ["Improve technique","Build strength","Lose weight","Compete","Stay consistent","Recover better"];
const HOURS = ["1–3 h","4–6 h","7–10 h","10+ h"];
const SOURCES = ["App Store","Friend","Instagram","TikTok","Coach","Other"];

type Step = {
  key: keyof FormState;
  question: string;
  type: "text" | "choice" | "number";
  options?: string[];
  unit?: string;
  placeholder?: string;
};

type FormState = {
  name: string; sport: string; difficulty: string; goal: string;
  height: string; weight: string; weeklyHours: string; source: string;
};

const STEPS: Step[] = [
  { key: "name",        question: "What's your name?",                  type: "text",   placeholder: "Your first name" },
  { key: "sport",       question: "What sport do you practice?",        type: "choice", options: SPORTS },
  { key: "difficulty",  question: "What's your biggest difficulty?",    type: "choice", options: DIFFICULTIES },
  { key: "goal",        question: "What's your main goal?",             type: "choice", options: GOALS },
  { key: "height",      question: "What's your height?",                type: "number", unit: "cm", placeholder: "175" },
  { key: "weight",      question: "What's your weight?",                type: "number", unit: "kg", placeholder: "72" },
  { key: "weeklyHours", question: "How many hours do you train weekly?",type: "choice", options: HOURS },
  { key: "source",      question: "How did you discover Traino?",       type: "choice", options: SOURCES },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: "", sport: "", difficulty: "", goal: "", height: "", weight: "", weeklyHours: "", source: "",
  });

  const total = STEPS.length;
  const cur = STEPS[step];
  const value = form[cur.key];
  const canNext = !!String(value).trim();

  const set = (v: string) => setForm((f) => ({ ...f, [cur.key]: v }));

  const next = () => {
    if (!canNext) return;
    if (step < total - 1) { setStep(step + 1); return; }
    saveProfile({ ...form, onboarded: true });
    navigate({ to: "/analyze" });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[440px] items-center justify-between px-5 py-4">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate({ to: "/auth" })}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/80"
            aria-label="Back"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">{step + 1} / {total}</p>
          <div className="w-9" />
        </div>
        <div className="mx-auto max-w-[440px] px-5 pb-3">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-white transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[440px] px-6 pb-40 pt-12">
        <p className="text-[12px] uppercase tracking-[0.22em] text-white/45">Question {step + 1}</p>
        <h1 className="mt-3 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em]">{cur.question}</h1>

        <div className="mt-10">
          {cur.type === "text" && (
            <input
              autoFocus
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={cur.placeholder}
              className="w-full border-b border-white/15 bg-transparent pb-3 text-[22px] font-medium text-white placeholder:text-white/25 focus:border-white focus:outline-none"
            />
          )}
          {cur.type === "number" && (
            <div className="flex items-baseline gap-3 border-b border-white/15 pb-3 focus-within:border-white">
              <input
                autoFocus
                inputMode="numeric"
                value={value}
                onChange={(e) => set(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder={cur.placeholder}
                className="flex-1 bg-transparent text-[28px] font-medium text-white placeholder:text-white/25 focus:outline-none"
              />
              <span className="text-[15px] text-white/55">{cur.unit}</span>
            </div>
          )}
          {cur.type === "choice" && (
            <div className="space-y-2">
              {cur.options!.map((o) => {
                const active = value === o;
                return (
                  <button
                    key={o}
                    onClick={() => set(o)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left text-[15px] font-medium transition ${
                      active ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/90 to-transparent pb-[env(safe-area-inset-bottom)] pt-6">
        <div className="mx-auto max-w-[440px] px-6 pb-5">
          <button
            onClick={next}
            disabled={!canNext}
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[15px] font-semibold text-black transition disabled:opacity-25"
          >
            {step === total - 1 ? "Generate my plan" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
