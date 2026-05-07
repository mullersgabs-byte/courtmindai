import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/profile";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Traino" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: getProfile().onboarded ? "/home" : "/onboarding" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: getProfile().onboarded ? "/home" : "/onboarding" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: getProfile().onboarded ? "/home" : "/onboarding" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/onboarding" },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: "/onboarding" });
        else { setInfo("Account created. Check your email to confirm."); setMode("signin"); }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setInfo("Check your inbox.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  };

  const title = mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password";
  const cta   = mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link";

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[440px] items-center justify-between px-5 py-4">
          <Link to="/" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04]"><ChevronLeft size={16} /></Link>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">Traino</p>
          <div className="w-9" />
        </div>
      </header>

      <main className="mx-auto max-w-[400px] px-6 pt-12 pb-24">
        <h1 className="text-[30px] font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="mt-2 text-[14px] text-white/55">
          {mode === "signin"  && "Sign in to continue training."}
          {mode === "signup"  && "Set up your account in seconds."}
          {mode === "forgot"  && "We'll send a reset link to your email."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] divide-y divide-white/5">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email"
              className="w-full bg-transparent px-4 py-3.5 text-[15px] text-white placeholder:text-white/35 focus:outline-none" />
            {mode !== "forgot" && (
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full bg-transparent px-4 py-3.5 text-[15px] text-white placeholder:text-white/35 focus:outline-none" />
            )}
          </div>

          {error && <p className="rounded-xl border border-white/15 bg-white/[0.04] p-3 text-[13px] text-white/85">{error}</p>}
          {info  && <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[13px] text-white/75">{info}</p>}

          <button type="submit" disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-black disabled:opacity-50">
            {loading ? "Loading…" : cta}
          </button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[13px] text-white/55">
          {mode !== "forgot" ? (
            <button onClick={() => { setMode("forgot"); setError(null); setInfo(null); }} className="hover:text-white">Forgot password?</button>
          ) : <span />}
          <button onClick={() => { setError(null); setInfo(null); setMode(mode === "signin" ? "signup" : "signin"); }} className="hover:text-white">
            {mode === "signin" ? "Create one" : "I have an account"}
          </button>
        </div>
      </main>
    </div>
  );
}
