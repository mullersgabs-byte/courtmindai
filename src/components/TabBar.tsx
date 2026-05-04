import { Link, useLocation } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";

const tabs = [
  { to: "/home", key: "tab.home" },
  { to: "/training", key: "tab.training" },
  { to: "/analyze", key: "tab.analyze" },
  { to: "/profile", key: "tab.profile" },
] as const;

export function TabBar() {
  const { t } = useT();
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[480px] items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map((tab) => {
          const active = pathname === tab.to || (tab.to !== "/home" && pathname.startsWith(tab.to));
          return (
            <Link key={tab.to} to={tab.to}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium tracking-wide transition ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              <span className={`h-1 w-1 rounded-full ${active ? "bg-foreground" : "bg-transparent"}`} />
              {t(tab.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}