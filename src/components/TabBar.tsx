import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Users, BarChart3, User as UserIcon, Plus, Video, FileText, Share2, MessageSquare, X } from "lucide-react";
import { useState } from "react";

const tabs = [
  { to: "/home", icon: Home, label: "Home", match: (p: string) => p === "/home" },
  { to: "/friends", icon: Users, label: "Friends", match: (p: string) => p.startsWith("/friends") || p.startsWith("/messages") || p.startsWith("/events") },
] as const;
const tabsRight = [
  { to: "/dashboard", icon: BarChart3, label: "Stats", match: (p: string) => p.startsWith("/dashboard") },
  { to: "/profile", icon: UserIcon, label: "Profile", match: (p: string) => p.startsWith("/profile") },
] as const;

export function TabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const Tab = ({ to, icon: Icon, label, active }: any) => (
    <Link
      to={to}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition ${
        active ? "text-white" : "text-white/45"
      }`}
    >
      <Icon size={20} strokeWidth={1.75} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </Link>
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="mx-auto mb-[env(safe-area-inset-bottom)] mt-3 flex max-w-[440px] items-end gap-3 px-4 pb-3 pointer-events-auto">
          <div
            className="flex flex-1 items-center rounded-full border border-white/10 bg-black/60 backdrop-blur-2xl"
            style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.55)" }}
          >
            {tabs.map((t) => <Tab key={t.to} {...t} active={t.match(pathname)} />)}
            <div className="w-14" />
            {tabsRight.map((t) => <Tab key={t.to} {...t} active={t.match(pathname)} />)}
          </div>
        </div>
        {/* Floating + */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Create"
          className="pointer-events-auto fixed left-1/2 -translate-x-1/2 grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-white text-black shadow-[0_18px_50px_rgba(255,255,255,0.18)] transition active:scale-95"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 22px)" }}
        >
          <Plus size={24} strokeWidth={2} />
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-[env(safe-area-inset-bottom)] w-full max-w-[440px] rounded-t-3xl border-t border-white/10 bg-[oklch(0.13_0_0)]/95 p-5 backdrop-blur-2xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-white">Create</p>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80">
                <X size={15} />
              </button>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { icon: Video, label: "Record workout", to: "/training" },
                { icon: FileText, label: "Create post", to: "/home" },
                { icon: Share2, label: "Share progress", to: "/dashboard" },
                { icon: MessageSquare, label: "Write update", to: "/home" },
              ].map((it) => (
                <button
                  key={it.label}
                  onClick={() => { setOpen(false); navigate({ to: it.to }); }}
                  className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white">
                    <it.icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="text-[13px] font-medium text-white">{it.label}</span>
                </button>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
