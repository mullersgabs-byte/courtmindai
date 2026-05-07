import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Traino — Train smarter" },
      { name: "description", content: "AI-powered sports analysis. A premium training app for real athletes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: getProfile().onboarded ? "/home" : "/onboarding" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen max-w-[440px] flex-col justify-between px-6 pt-16 pb-10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/55">Traino</p>
          <h1 className="mt-8 text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">
            Train smarter.<br />
            <span className="text-white/55">Move better.</span>
          </h1>
          <p className="mt-5 max-w-[320px] text-[15px] leading-relaxed text-white/65">
            Record your training, get instant AI analysis on posture, balance and execution, and follow a plan built around you.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/auth" search={{ mode: "signup" } as never} className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[15px] font-semibold text-black">
            Create account
          </Link>
          <Link to="/auth" className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-[15px] font-medium text-white">
            Log in
          </Link>
          <p className="pt-2 text-center text-[11px] uppercase tracking-[0.22em] text-white/35">AI sports analysis · Realtime feedback</p>
        </div>
      </main>
    </div>
  );
}
