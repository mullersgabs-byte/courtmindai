import { createFileRoute } from "@tanstack/react-router";
import { TabBar } from "@/components/TabBar";
import { ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Traino" }] }),
  component: MessagesPage,
});

const THREADS = [
  { name: "Julia M.", initials: "JM", last: "Let's run tomorrow at 7?", when: "2m" },
  { name: "Lucas R.", initials: "LR", last: "Shared a workout with you.", when: "1h" },
  { name: "Maria S.", initials: "MS", last: "Form analysis looked great.", when: "Yesterday" },
];

function MessagesPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-36">
      <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[440px] items-center gap-3 px-5 py-4">
          <Link to="/friends" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04]"><ChevronLeft size={16} /></Link>
          <h1 className="text-[18px] font-semibold tracking-tight">Messages</h1>
        </div>
      </header>

      <ul className="mx-auto max-w-[440px] divide-y divide-white/5">
        {THREADS.map((t) => (
          <li key={t.name} className="flex items-center gap-3 px-5 py-4">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-[12px] font-semibold">{t.initials}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold">{t.name}</p>
                <p className="text-[11px] text-white/45">{t.when}</p>
              </div>
              <p className="mt-0.5 truncate text-[12px] text-white/55">{t.last}</p>
            </div>
          </li>
        ))}
      </ul>
      <TabBar />
    </div>
  );
}
