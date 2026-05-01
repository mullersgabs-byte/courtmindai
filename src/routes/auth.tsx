import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — CourtMind Elite" },
      { name: "description", content: "Sign in or create your CourtMind account." },
    ],
  }),
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

  // Already signed in? send to /home.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) navigate({ to: "/home" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/home" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/home" },
        });
        if (error) throw error;
        // auto-confirm is on, so a session is usually created immediately.
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: "/home" });
        else setInfo("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setInfo("Check your inbox for a reset link.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(prettifyError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
             Back
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">
            {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
          </p>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto grid max-w-[480px] place-items-center px-5 py-16 sm:py-24">
        <div className="w-full animate-float-up">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            CourtMind
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2rem,5vw,3rem)] font-medium leading-[1] tracking-[-0.04em]">
            {mode === "signin" && (<>Welcome <span className="font-serif italic font-normal text-platinum-gradient">back.</span></>)}
            {mode === "signup" && (<>Create your <span className="font-serif italic font-normal text-platinum-gradient">account.</span></>)}
            {mode === "forgot" && (<>Reset your <span className="font-serif italic font-normal text-platinum-gradient">password.</span></>)}
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            {mode === "signin" && "Sign in to continue your training."}
            {mode === "signup" && "An email and password is all we need."}
            {mode === "forgot" && "We'll email a link to set a new one."}
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-4">
            <Field>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" autoComplete="email"
                className="w-full bg-transparent text-[15px] focus:outline-none"
              />
            </Field>

            {mode !== "forgot" && (
              <Field>
                <input
                  type="password" required minLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)" autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="w-full bg-transparent text-[15px] focus:outline-none"
                />
              </Field>
            )}

            {error && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-[13px] text-destructive">{error}</p>
            )}
            {info && (
              <p className="rounded-xl border hairline bg-card p-3 text-[13px] text-foreground/85">{info}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {loading
                ? <> Working…</>
                : <>{mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"} </>}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px] text-muted-foreground">
            {mode !== "forgot" ? (
              <button onClick={() => { setMode("forgot"); setError(null); setInfo(null); }} className="hover:text-foreground">
                Forgot password?
              </button>
            ) : <span />}
            <button
              onClick={() => {
                setError(null); setInfo(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="hover:text-foreground"
            >
              {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border hairline bg-card px-4 py-3 transition focus-within:border-foreground/40">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </label>
  );
}

function prettifyError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Invalid email or password.";
  if (m.includes("user already registered")) return "This email is already registered. Try signing in.";
  if (m.includes("password") && m.includes("weak")) return "Password is too weak. Try something stronger.";
  if (m.includes("password") && m.includes("pwned")) return "This password appears in known leaks. Choose another.";
  return msg;
}
