import { Link, useLocation } from "@tanstack/react-router";
import { Home, Dumbbell, Sparkles, User } from "lucide-react";
import type { ComponentType } from "react";
import { useT } from "@/lib/i18n";

type Tab = { to: "/home" | "/training" | "/feedback" | "/profile"; key: string; Icon: ComponentType<{ className?: string }> };

const tabs: Tab[] = [
  { to: "/home", key: "tab.home", Icon: Home },
  { to: "/training", key: "tab.training", Icon: Dumbbell },
  { to: "/feedback", key: "tab.analyze", Icon: Sparkles },
  { to: "/profile", key: "tab.profile", Icon: User },
];

export function TabBar() {
  const { t } = useT();
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background to-transparent" />
      <div className="mx-auto max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
        <div className="relative flex items-stretch justify-around rounded-full border border-foreground/10 bg-background/80 p-1.5 shadow-elev backdrop-blur-xl">
          {tabs.map(({ to, key, Icon }) => {
            const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`tap press flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-2 text-[10px] font-medium tracking-tight transition ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
                <span>{t(key)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}