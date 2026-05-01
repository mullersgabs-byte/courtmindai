import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — CourtMind Elite" },
      { name: "description", content: "Set a new password for your account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Supabase puts the access token in the URL hash and triggers a PASSWORD_RECOVERY event.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // If a session already exists from the recovery link, allow updates.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      // Send them straight back into the app — they're signed in.
      setTimeout(() => navigate({ to: "/home" }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased bg-radial-court">
      <header className="sticky top-0 z-40 glass border-b hairline">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link to="/auth" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground">
             Back to sign in
          </Link>
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted-foreground">Reset password</p>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto grid max-w-[480px] place-items-center px-5 py-16 sm:py-24">
        <div className="w-full animate-float-up">
          <h1 className="text-balance text-[clamp(2rem,5vw,3rem)] font-medium leading-[1] tracking-[-0.04em]">
            Set a new <span className="font-serif italic font-normal text-platinum-gradient">password.</span>
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            {ready
              ? "Choose a strong password you don't use elsewhere."
              : "Open the recovery link from your email to continue. If you opened it here directly, give it a moment."}
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-4">
            <label className="flex items-center gap-3 rounded-xl border hairline bg-card px-4 py-3">
              
              <input
                type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password" autoComplete="new-password"
                disabled={!ready}
                className="w-full bg-transparent text-[15px] focus:outline-none disabled:opacity-50"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl border hairline bg-card px-4 py-3">
              
              <input
                type="password" required minLength={6} value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password" autoComplete="new-password"
                disabled={!ready}
                className="w-full bg-transparent text-[15px] focus:outline-none disabled:opacity-50"
              />
            </label>

            {error && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-[13px] text-destructive">{error}</p>
            )}
            {done && (
              <p className="rounded-xl border hairline bg-card p-3 text-[13px] text-foreground/85">
                Password updated. Taking you back to the app…
              </p>
            )}

            <button
              type="submit" disabled={!ready || loading || done}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {loading
                ? <> Updating…</>
                : <>Update password </>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
