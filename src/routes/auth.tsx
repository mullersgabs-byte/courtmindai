import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — CourtMind" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const { t } = useT();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) navigate({ to: "/home" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (s) navigate({ to: "/home" }); });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/home" },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: "/onboarding" });
        else { setInfo("Account created."); setMode("signin"); }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setInfo("Check your inbox.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const titleKey = mode === "signin" ? "auth.title.signin" : mode === "signup" ? "auth.title.signup" : "auth.title.forgot";
  const submitKey = mode === "signin" ? "auth.submit.signin" : mode === "signup" ? "auth.submit.signup" : "auth.submit.forgot";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[480px] items-center justify-between px-5 py-4">
          <Link to="/" className="text-[14px] text-muted-foreground hover:text-foreground">{t("common.back")}</Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">{t(titleKey)}</p>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-[400px] px-6 pt-16 pb-24">
        <h1 className="text-[34px] font-semibold tracking-[-0.03em]">{t("auth.welcome")}</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {mode === "signin" && t("auth.subtitle.signin")}
          {mode === "signup" && t("auth.subtitle.signup")}
          {mode === "forgot" && " "}
        </p>

        <form onSubmit={submit} className="mt-10 space-y-3">
          <div className="overflow-hidden rounded-2xl border bg-card divide-y">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email")} autoComplete="email"
              className="w-full bg-transparent px-4 py-3.5 text-[15px] focus:outline-none" />
            {mode !== "forgot" && (
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")} autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full bg-transparent px-4 py-3.5 text-[15px] focus:outline-none" />
            )}
          </div>

          {error && <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-[13px] text-destructive">{error}</p>}
          {info && <p className="rounded-xl border bg-card p-3 text-[13px]">{info}</p>}

          <button type="submit" disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background transition hover:opacity-90 disabled:opacity-60">
            {loading ? t("common.loading") : t(submitKey)}
          </button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground">
          {mode !== "forgot" ? (
            <button onClick={() => { setMode("forgot"); setError(null); setInfo(null); }} className="hover:text-foreground">
              {t("auth.forgot")}
            </button>
          ) : <span />}
          <button onClick={() => { setError(null); setInfo(null); setMode(mode === "signin" ? "signup" : "signin"); }} className="hover:text-foreground">
            {mode === "signin" ? t("auth.need.account") : t("auth.have.account")}
          </button>
        </div>
      </main>
    </div>
  );
}