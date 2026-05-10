import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/analyze")({
  head: () => ({ meta: [{ title: "Analyzing — Traino" }] }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 3600);
    const t2 = setTimeout(() => navigate({ to: "/plan" }), 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div
      className="grid min-h-screen place-items-center bg-black transition-opacity duration-700"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="flex items-center gap-2">
        <Dot delay="0s" />
        <Dot delay="0.2s" />
        <Dot delay="0.4s" />
      </div>
      <style>{`
        @keyframes trainoDot {
          0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full bg-white"
      style={{ animation: "trainoDot 1.2s ease-in-out infinite", animationDelay: delay }}
    />
  );
}
