import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { saveProfile } from "@/lib/profile";
import { ArrowUp } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Setup — Traino" }] }),
  component: OnboardingPage,
});

type Step = {
  key: "name" | "sport" | "difficulty" | "goal" | "height" | "weight" | "weeklyHours" | "source";
  question: string;
  suggestions?: string[];
  unit?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric";
};

const STEPS: Step[] = [
  { key: "name",        question: "What's your name?", placeholder: "Type your name" },
  { key: "sport",       question: "What sport do you practice?", suggestions: ["Basketball","Soccer","Volleyball","Gym","Running","Tennis"] },
  { key: "difficulty",  question: "What's your biggest difficulty?", suggestions: ["Consistency","Technique","Endurance","Strength","Mobility"] },
  { key: "goal",        question: "What's your main goal?", suggestions: ["Improve technique","Build strength","Lose weight","Compete","Stay consistent"] },
  { key: "height",      question: "What's your height?", placeholder: "e.g. 175", unit: "cm", inputMode: "numeric" },
  { key: "weight",      question: "What's your weight?", placeholder: "e.g. 72", unit: "kg", inputMode: "numeric" },
  { key: "weeklyHours", question: "How many hours do you train weekly?", suggestions: ["1–3 h","4–6 h","7–10 h","10+ h"] },
  { key: "source",      question: "How did you discover Traino?", suggestions: ["App Store","Friend","Instagram","TikTok","Coach"] },
];

type Msg = { from: "ai" | "user"; text: string };

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(true);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Push next AI question when step changes
  useEffect(() => {
    if (step >= STEPS.length) return;
    setTyping(true);
    const t = setTimeout(() => {
      setMessages((m) => [...m, { from: "ai", text: STEPS[step].question }]);
      setTyping(false);
    }, 650);
    return () => clearTimeout(t);
  }, [step]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const cur = STEPS[step];

  const submit = (raw: string) => {
    const value = raw.trim();
    if (!value || typing) return;
    const display = cur.unit ? `${value} ${cur.unit}` : value;
    setMessages((m) => [...m, { from: "user", text: display }]);
    const nextProfile = { ...profile, [cur.key]: value };
    setProfile(nextProfile);
    setInput("");

    if (step >= STEPS.length - 1) {
      saveProfile({ ...nextProfile, onboarded: true });
      setTimeout(() => navigate({ to: "/analyze" }), 600);
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="px-6 pt-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Traino</p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-6 pt-8">
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-snug animate-fade-in ${
                m.from === "ai"
                  ? "self-start border border-white/10 bg-white/[0.04] text-white"
                  : "self-end bg-white text-black"
              }`}
            >
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="self-start rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <span className="flex items-center gap-1">
                <Pulse delay="0s" /><Pulse delay="0.15s" /><Pulse delay="0.3s" />
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/90 px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[440px]">
          {cur?.suggestions && (
            <div className="mb-3 flex flex-wrap gap-2">
              {cur.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  disabled={typing}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-white/85 transition hover:bg-white/[0.08] disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); submit(input); }}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2"
          >
            <input
              value={input}
              onChange={(e) => {
                const v = e.target.value;
                setInput(cur?.inputMode === "numeric" ? v.replace(/[^\d.]/g, "") : v);
              }}
              inputMode={cur?.inputMode === "numeric" ? "numeric" : "text"}
              placeholder={cur?.placeholder ?? "Type your answer"}
              className="flex-1 bg-transparent py-2 text-[15px] text-white placeholder:text-white/30 focus:outline-none"
            />
            {cur?.unit && <span className="text-[13px] text-white/45">{cur.unit}</span>}
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-black transition disabled:opacity-30"
              aria-label="Send"
            >
              <ArrowUp size={16} strokeWidth={2.4} />
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes trainoDot {
          0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}

function Pulse({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-white/60"
      style={{ animation: "trainoDot 1.2s ease-in-out infinite", animationDelay: delay }}
    />
  );
}
