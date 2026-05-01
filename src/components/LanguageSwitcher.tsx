import { useEffect, useRef, useState } from "react";
import { LANGUAGES, useT, type Lang } from "@/lib/i18n";

/** Compact, unobtrusive language selector that drops down on click. */
export function LanguageSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { lang, setLang, t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  const triggerClass =
    tone === "light"
      ? "border-foreground/20 text-foreground/90 hover:border-foreground/40"
      : "border-foreground/15 text-muted-foreground hover:text-foreground hover:border-foreground/30";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("common.language")}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition ${triggerClass}`}
      >
        <span aria-hidden>🌐</span>
        <span>{current.flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-2xl border hairline bg-popover shadow-xl animate-fade-in">
          <div className="border-b hairline px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {t("common.language")}
            </p>
          </div>
          <ul>
            {LANGUAGES.map((l) => {
              const active = l.code === lang;
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setLang(l.code as Lang);
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition",
                      active
                        ? "bg-foreground/5 text-foreground"
                        : "text-foreground/85 hover:bg-foreground/5 hover:text-foreground",
                    ].join(" ")}
                  >
                    <span>{l.label}</span>
                    <span
                      className={`text-[10px] uppercase tracking-[0.18em] ${
                        active ? "text-court" : "text-muted-foreground"
                      }`}
                    >
                      {l.flag}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}