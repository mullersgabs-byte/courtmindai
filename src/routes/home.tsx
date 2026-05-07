import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, Sparkles, Bell } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { getProfile } from "@/lib/profile";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Traino" }] }),
  component: HomePage,
});

type Post = {
  id: string;
  user: string;
  initials: string;
  workout: string;
  when: string;
  stats: { duration: string; calories: string; exercises: string; pace: string; aiScore: string };
  note?: string;
};

const SEED: Post[] = [
  {
    id: "1", user: "Julia M.", initials: "JM", workout: "Strength · Lower body", when: "2h",
    stats: { duration: "48 min", calories: "412", exercises: "9", pace: "—", aiScore: "92" },
    note: "Form felt clean today. Knees stayed aligned through every squat set.",
  },
  {
    id: "2", user: "Lucas R.", initials: "LR", workout: "Running · Tempo run", when: "5h",
    stats: { duration: "36 min", calories: "388", exercises: "—", pace: "4:42 /km", aiScore: "88" },
    note: "Cadence improved over the last kilometer.",
  },
  {
    id: "3", user: "Maria S.", initials: "MS", workout: "Tennis · Serve session", when: "Yesterday",
    stats: { duration: "55 min", calories: "326", exercises: "5", pace: "—", aiScore: "84" },
  },
];

function HomePage() {
  const [name, setName] = useState("Athlete");
  useEffect(() => { const p = getProfile(); if (p.name) setName(p.name.split(" ")[0]); }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-36">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[440px] items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Traino</p>
            <p className="mt-0.5 text-[15px] font-semibold">Hi, {name}</p>
          </div>
          <button aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/80">
            <Bell size={15} />
          </button>
        </div>
        <div className="mx-auto flex max-w-[440px] gap-2 px-5 pb-3 text-[13px]">
          {["Following", "Discover", "Coaches"].map((tab, i) => (
            <button
              key={tab}
              className={`rounded-full px-4 py-1.5 ${i === 0 ? "bg-white text-black" : "border border-white/10 text-white/65"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-[440px] divide-y divide-white/5">
        {SEED.map((p) => <PostCard key={p.id} post={p} />)}
      </main>

      <TabBar />
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="px-5 py-5">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-[12px] font-semibold tracking-wide text-white">
          {post.initials}
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold leading-tight">{post.user}</p>
          <p className="mt-0.5 text-[12px] text-white/45">{post.workout} · {post.when}</p>
        </div>
      </header>

      {post.note && <p className="mt-4 text-[14px] leading-relaxed text-white/85">{post.note}</p>}

      <dl className="mt-4 grid grid-cols-5 gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center">
        <Stat k="Time"     v={post.stats.duration} />
        <Stat k="Kcal"     v={post.stats.calories} />
        <Stat k="Sets"     v={post.stats.exercises} />
        <Stat k="Pace"     v={post.stats.pace} />
        <Stat k="AI"       v={post.stats.aiScore} highlight />
      </dl>

      <div className="mt-4 flex items-center gap-5 text-white/65">
        <Action onClick={() => setLiked((v) => !v)} icon={<Heart size={17} fill={liked ? "currentColor" : "none"} />} label={liked ? "Liked" : "Like"} active={liked} />
        <Action icon={<MessageCircle size={17} />} label="Comment" />
        <Action icon={<Share2 size={17} />} label="Share" />
        <div className="ml-auto">
          <button className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white">
            <Sparkles size={13} /> Analyze
          </button>
        </div>
      </div>
    </article>
  );
}

function Stat({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div>
      <p className={`text-[13px] font-semibold ${highlight ? "text-white" : "text-white/90"}`}>{v}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/40">{k}</p>
    </div>
  );
}

function Action({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 text-[12px] ${active ? "text-white" : "text-white/65"}`}>
      {icon}<span>{label}</span>
    </button>
  );
}
