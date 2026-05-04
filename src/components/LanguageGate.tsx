import { useEffect, useState, type ReactNode } from "react";
import { LANGUAGES, useT, type Lang } from "@/lib/i18n";

export function LanguageGate({ children }: { children: ReactNode }) {
  const { hasChosen, setLang, t } = useT();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || hasChosen) return <>{children}</>;

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground px-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">CourtMind</p>
        <h1 className="mt-3 text-[28px] font-medium tracking-[-0.02em]">{t("lang.choose")}</h1>
        <div className="mt-8 space-y-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code as Lang)}
              className="flex w-full items-center justify-between rounded-2xl border bg-card px-5 py-4 text-left text-[15px] transition hover:bg-foreground/5"
            >
              <span>{l.label}</span>
              <span className="text-[12px] text-muted-foreground">{l.flag}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}