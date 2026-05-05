import { createFileRoute, Link } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourtMind" },
      { name: "description", content: "Aplicativo de treino com análise por vídeo e acompanhamento pessoal." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useT();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient premium backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-radial-court" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-foreground/[0.06] blur-3xl" />
        <div className="absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-foreground/[0.04] blur-3xl" />
        <div className="absolute inset-0 grain opacity-60" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-[480px] flex-col px-5 pb-10 pt-6">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-foreground/15 bg-foreground/[0.04] text-[13px] font-semibold tracking-tight">
              CM
            </span>
            <div className="leading-tight">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">{t("app.ready")}</p>
              <p className="text-[14px] font-semibold tracking-tight">CourtMind</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-full border border-foreground/15 bg-foreground/[0.03] px-4 text-[13px] font-medium text-foreground/90 transition hover:bg-foreground/[0.07]"
            >
              {t("auth.title.signin")}
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mt-10 overflow-hidden rounded-[2.25rem] border border-foreground/10 bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.01] p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div aria-hidden className="absolute inset-x-0 -top-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-foreground/40 to-transparent" />
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse-soft" />
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">{t("home.title")}</p>
          </div>
          <h2 className="mt-5 text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-balance">
            {t("app.main.title")}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty">
            {t("app.main.subtitle")}
          </p>
          <div className="mt-8 flex flex-col gap-2.5">
            <Link
              to="/onboarding"
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-foreground px-6 text-[15px] font-medium text-background shadow-[0_10px_30px_-10px_rgba(255,255,255,0.35)] transition hover:opacity-95"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{t("app.start")}</span>
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-12 items-center justify-center rounded-full border border-foreground/15 bg-foreground/[0.02] px-6 text-[15px] font-medium text-foreground transition hover:bg-foreground/[0.06]"
            >
              {t("app.login")}
            </Link>
          </div>
        </section>

        {/* Stats strip */}
        <section className="mt-5 grid grid-cols-3 overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02] backdrop-blur">
          <Stat value="0" label={t("home.stat.sessions")} />
          <div className="border-x border-foreground/10"><Stat value="0" label={t("home.stat.minutes")} /></div>
          <Stat value="0" label={t("home.stat.streak")} />
        </section>

        {/* Sections */}
        <section className="mt-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">{t("app.sections")}</p>
            <span className="h-px flex-1 ml-3 bg-gradient-to-r from-foreground/15 to-transparent" />
          </div>
          <Feature index="01" title={t("training.title")} description={t("training.subtitle")} to="/training" />
          <Feature index="02" title={t("profile.title")} description={t("app.profile.description")} to="/profile" />
          <Feature index="03" title={t("profile.notifications")} description={t("notif.body")} to="/profile" />
        </section>

        <div className="mt-auto pt-8">
          <Link
            to="/home"
            className="group flex items-center justify-between rounded-full border border-foreground/12 bg-foreground/[0.03] px-6 py-4 text-[14px] font-medium transition hover:bg-foreground/[0.07]"
          >
            <span>{t("app.open.home")}</span>
            <span className="flex items-center gap-1.5 text-muted-foreground transition group-hover:text-foreground">
              {t("common.continue")}
              <span aria-hidden>→</span>
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 py-5 text-center">
      <p className="text-[26px] font-semibold leading-none tracking-[-0.02em]">{value}</p>
      <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Feature({ index, title, description, to }: { index: string; title: string; description: string; to: "/training" | "/profile" }) {
  return (
    <Link
      to={to}
      className="group relative flex items-start gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-5 py-4 transition hover:border-foreground/25 hover:bg-foreground/[0.06]"
    >
      <span className="mt-0.5 text-[10px] font-medium tracking-[0.2em] text-muted-foreground">{index}</span>
      <div className="flex-1">
        <p className="text-[15px] font-semibold tracking-tight">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <span aria-hidden className="mt-1 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground">→</span>
    </Link>
  );
}
