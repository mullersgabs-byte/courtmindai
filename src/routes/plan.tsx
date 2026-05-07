import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/profile";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/plan")({
  head: () => ({ meta: [{ title: "Your plan — Traino" }] }),
  component: PlanPage,
});

type Card = { title: string; sport: string; duration: string; intensity: string; focus: string };

function buildPlan(sport: string, goal: string): Card[] {
  const s = sport || "Training";
  return [
    { title: "Foundation",  sport: s, duration: "32 min", intensity: "Moderate", focus: "Technique baseline" },
    { title: "Power",       sport: s, duration: "28 min", intensity: "High",     focus: "Explosive control" },
    { title: "Endurance",   sport: s, duration: "45 min", intensity: "Moderate", focus: "Aerobic capacity" },
    { title: "Mobility",    sport: s, duration: "20 min", intensity: "Low",      focus: "Joint stability" },
    { title: goal || "Goal",sport: s, duration: "35 min", intensity: "High",     focus: "Sport-specific drills" },
  ];
}

function PlanPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("Athlete");
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const p = getProfile();
    if (p.name) setName(p.name);
    setCards(buildPlan(p.sport || "", p.goal || ""));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <main className="mx-auto max-w-[440px] px-5 pt-14">
        <p className="text-[12px] uppercase tracking-[0.24em] text-white/45">Your plan is ready</p>
        <h1 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em]">
          {name}, your training<br />starts now.
        </h1>
        <p className="mt-3 text-[14px] text-white/55">A 5-session plan generated from your profile.</p>

        <div className="mt-8 -mx-5 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-3">
            {cards.map((c, i) => (
              <article
                key={i}
                className="snap-start shrink-0 w-[78%] rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                style={{ boxShadow: "0 18px 50px rgba(0,0,0,0.5)" }}
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{c.sport}</p>
                <h3 className="mt-2 text-[22px] font-semibold tracking-tight">{c.title}</h3>

                <dl className="mt-6 space-y-2 text-[13px]">
                  <Row k="Duration"  v={c.duration} />
                  <Row k="Intensity" v={c.intensity} />
                  <Row k="Focus"     v={c.focus} />
                </dl>

                <button
                  onClick={() => navigate({ to: "/training" })}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-black"
                >
                  Start <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>

        <Link
          to="/home"
          className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-[14px] font-medium text-white"
        >
          Skip to feed
        </Link>
      </main>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/5 pt-2 first:border-0 first:pt-0">
      <dt className="text-white/50">{k}</dt>
      <dd className="font-medium text-white">{v}</dd>
    </div>
  );
}
