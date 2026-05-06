import { Link, useLocation } from "@tanstack/react-router";
import { Home, Calendar, BarChart3, Settings } from "lucide-react";

const tabs = [
  { to: "/", icon: Home, match: (p: string) => p === "/" },
  { to: "/calendar", icon: Calendar, match: (p: string) => p.startsWith("/calendar") },
  { to: "/dashboard", icon: BarChart3, match: (p: string) => p.startsWith("/dashboard") },
  { to: "/profile", icon: Settings, match: (p: string) => p.startsWith("/profile") },
] as const;

export function TabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="mx-auto mb-[env(safe-area-inset-bottom)] mt-3 flex max-w-[420px] items-center justify-around rounded-full border border-white/10 bg-[oklch(0.16_0_0)]/95 px-3 py-2 backdrop-blur-xl"
        style={{ boxShadow: "0 10px 40px oklch(0 0 0 / 0.55)" }}
      >
        {tabs.map(({ to, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={`grid h-11 w-11 place-items-center rounded-full transition ${
                active ? "bg-white text-black" : "text-white/55 hover:text-white"
              }`}
            >
              <Icon size={20} strokeWidth={1.75} />
            </Link>
          );
        })}
      </div>
      <div className="h-3" />
    </nav>
  );
}