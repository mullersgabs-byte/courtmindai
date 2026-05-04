import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { saveProfile } from "@/lib/profile";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Setup — CourtMind" }] }),
  component: OnboardingPage,
});

const SPORTS = [
  "Tennis","Volleyball","Padel","Basketball","Football","Running","Cycling",
  "Swimming","Strength","CrossFit","Pilates","Yoga","Boxing","Climbing","Golf",
];
const LEVELS = ["beginner","intermediate","advanced"] as const;
const GOALS = ["technique","strength","fatloss","compete","consistency","recovery"] as const;
const FREQS = ["1","3","5"] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [sport, setSport] = useState("Tennis");
  const [level, setLevel] = useState<typeof LEVELS[number] | "">("");
  const [goal, setGoal] = useState<typeof GOALS[number] | "">("");
  const [freq, setFreq] = useState<typeof FREQS[number] | "">("");

  const total = 4;
  const canNext = [!!sport, !!level, !!goal, !!freq][step];

  const next = () => {
    if (!canNext) return;
    if (step < total - 1) { setStep(step + 1); return; }
    saveProfile({ sport, level: level as "beginner", goal, frequency: freq });
    navigate({ to: "/home" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-5 py-4">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="text-[14px] text-muted-foreground hover:text-foreground">{t("common.back")}</button>
          ) : (
            <Link to="/" className="text-[14px] text-muted-foreground hover:text-foreground">{t("common.cancel")}</Link>
          )}
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">{step + 1} / {total}</p>
          <div className="w-10" />
        </div>
        <div className="mx-auto max-w-[480px] px-5 pb-3">
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={`h-[3px] flex-1 rounded-full transition ${i <= step ? "bg-foreground" : "bg-foreground/15"}`} />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[480px] px-5 pb-32 pt-10">
        {step === 0 && (
          <Step title={t("onb.sport.title")} sub={t("onb.sport.sub")}>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.map((s) => <Choice key={s} active={sport === s} onClick={() => setSport(s)}>{s}</Choice>)}
            </div>
          </Step>
        )}
        {step === 1 && (
          <Step title={t("onb.level.title")} sub={t("onb.level.sub")}>
            <div className="space-y-2">
              {LEVELS.map((l) => <Choice key={l} active={level === l} onClick={() => setLevel(l)}>{t(`onb.level.${l}`)}</Choice>)}
            </div>
          </Step>
        )}
        {step === 2 && (
          <Step title={t("onb.goal.title")} sub={t("onb.goal.sub")}>
            <div className="space-y-2">
              {GOALS.map((g) => <Choice key={g} active={goal === g} onClick={() => setGoal(g)}>{t(`onb.goal.${g}`)}</Choice>)}
            </div>
          </Step>
        )}
        {step === 3 && (
          <Step title={t("onb.freq.title")} sub={t("onb.freq.sub")}>
            <div className="space-y-2">
              {FREQS.map((f) => <Choice key={f} active={freq === f} onClick={() => setFreq(f)}>{t(`onb.freq.${f}`)}</Choice>)}
            </div>
          </Step>
        )}

        <button onClick={next} disabled={!canNext}
          className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background transition hover:opacity-90 disabled:opacity-30">
          {step === total - 1 ? t("onb.finish") : t("common.continue")}
        </button>
      </main>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{title}</h1>
      <p className="mt-2 text-[14px] text-muted-foreground">{sub}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-4 text-left text-[15px] transition ${
        active ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-foreground/5"
      }`}>
      {children}
    </button>
  );
}