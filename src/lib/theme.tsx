import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type ThemeMode = "system" | "light" | "dark";
type Resolved = "light" | "dark";
const KEY = "courtmind.theme";

type Ctx = { mode: ThemeMode; resolved: Resolved; setMode: (m: ThemeMode) => void };
const ThemeContext = createContext<Ctx | null>(null);

function applyClass(resolved: Resolved) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.toggle("dark", resolved === "dark");
  html.classList.toggle("light", resolved === "light");
  html.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [resolved, setResolved] = useState<Resolved>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem(KEY) as ThemeMode | null)) || "dark";
    setModeState(stored);
  }, []);

  useEffect(() => {
    const mq = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const compute = (): Resolved => {
      if (mode === "light") return "light";
      if (mode === "dark") return "dark";
      return mq && mq.matches ? "dark" : "light";
    };
    const r = compute();
    setResolved(r);
    applyClass(r);
    const onChange = () => {
      if (mode === "system") {
        const r2 = compute();
        setResolved(r2);
        applyClass(r2);
      }
    };
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, [mode]);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    try { localStorage.setItem(KEY, m); } catch {}
  };

  return <ThemeContext.Provider value={{ mode, resolved, setMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const c = useContext(ThemeContext);
  if (!c) return { mode: "system" as ThemeMode, resolved: "dark" as Resolved, setMode: () => {} };
  return c;
}
