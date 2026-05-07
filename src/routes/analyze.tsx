import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/analyze")({
  head: () => ({ meta: [{ title: "Analyzing — Traino" }] }),
  component: AnalyzePage,
});

const STAGES = [
  "Analyzing your performance",
  "Identifying movement patterns",
  "Creating your personalized plan",
];

function AnalyzePage() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setI((n) => {
        if (n >= STAGES.length - 1) {
          clearInterval(interval);
          setTimeout(() => navigate({ to: "/plan" }), 1100);
          return n;
        }
        return n + 1;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-black px-6 text-white">
      <div className="w-full max-w-[400px] text-center">
        <div className="mx-auto mb-12 grid h-20 w-20 place-items-center">
          <div className="absolute h-20 w-20 animate-ping rounded-full bg-white/5" />
          <div className="relative h-16 w-16 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-xl">
            <div className="absolute inset-2 rounded-full border border-white/25 animate-spin" style={{ borderTopColor: "transparent", animationDuration: "2.4s" }} />
          </div>
        </div>

        <p className="text-[12px] uppercase tracking-[0.28em] text-white/45">Traino AI</p>
        <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.02em]">{STAGES[i]}</h1>

        <ul className="mt-12 space-y-3 text-left">
          {STAGES.map((s, idx) => {
            const done = idx < i;
            const active = idx === i;
            return (
              <li key={s} className="flex items-center gap-3 text-[14px]">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${
                    done ? "border-white bg-white text-black" : active ? "border-white text-white" : "border-white/15 text-white/30"
                  }`}
                >
                  {done ? "✓" : idx + 1}
                </span>
                <span className={done ? "text-white/55" : active ? "text-white" : "text-white/35"}>{s}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
