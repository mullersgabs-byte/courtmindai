import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TabBar } from "@/components/TabBar";
import { getProfile, clearProfile, type Profile } from "@/lib/profile";
import { supabase } from "@/integrations/supabase/client";
import { Settings, LogOut } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Traino" }] }),
  component: ProfilePage,
});

const TABS = ["All", "Workouts", "Progress", "Analysis"] as const;

function ProfilePage() {
  const navigate = useNavigate();
  const [p, setP] = useState<Profile>({});
  const [tab, setTab] = useState<typeof TABS[number]>("All");

  useEffect(() => { setP(getProfile()); }, []);
  const initials = (p.name || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  const signOut = async () => {
    await supabase.auth.signOut();
    clearProfile();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-36">
      <header className="flex items-center justify-between px-5 pt-12">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Profile</p>
        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04]"><Settings size={15} /></button>
          <button onClick={signOut} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04]"><LogOut size={15} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-[440px] px-5 pt-6">
        <div className="flex items-center gap-4">
          <span className="grid h-20 w-20 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-[24px] font-semibold tracking-wide">{initials}</span>
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">{p.name || "Athlete"}</h1>
            <p className="text-[13px] text-white/55">{p.sport || "—"} · {p.goal || "—"}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <Stat k="Followers" v="128" />
          <Stat k="Following" v="86" />
          <Stat k="Streak"    v="5d" />
        </div>

        <div className="mt-6 inline-flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-1.5 text-[13px] ${tab === t ? "border-white bg-white text-black" : "border-white/10 text-white/65"}`}>{t}</button>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center text-[13px] text-white/55">
          {tab} appears here as you train.
        </div>
      </main>

      <TabBar />
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[18px] font-semibold tracking-tight">{v}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-white/45">{k}</p>
    </div>
  );
}
