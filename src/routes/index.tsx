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
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen max-w-[440px] flex-col px-5 pb-10 pt-6">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-[12px] font-semibold text-background">CM</span>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{t("app.ready")}</p>
              <p className="text-[14px] font-semibold tracking-tight">CourtMind</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-full border border-foreground/15 px-4 text-[13px] font-medium transition hover:bg-foreground/[0.06]"
            >
              {t("auth.title.signin")}
            </Link>
          </div>
        </header>

        {/* Pill tabs */}
        <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Pill active>{t("home.title")}</Pill>
          <Pill>{t("training.title")}</Pill>
          <Pill>{t("profile.title")}</Pill>
          <Pill>{t("profile.notifications")}</Pill>
        </nav>

        {/* Hero card — big featured tile */}
        <section className="mt-4 rounded-[28px] bg-foreground p-6 text-background">
          <div className="flex items-start justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-background/10 text-[14px]">▶</span>
            <span className="rounded-full bg-background/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em]">{t("app.ready")}</span>
          </div>
          <h2 className="mt-8 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] text-balance">
            {t("app.main.title")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-background/70">
            {t("app.main.subtitle")}
          </p>
          <div className="mt-6 flex items-center gap-2">
            <Link
              to="/onboarding"
              className="inline-flex h-12 flex-1 items-center justify-between rounded-full bg-background px-5 text-[15px] font-medium text-foreground transition hover:opacity-95"
            >
              <span>{t("app.start")}</span>
              <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background">→</span>
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-12 items-center justify-center rounded-full border border-background/30 px-5 text-[14px] font-medium text-background transition hover:bg-background/10"
            >
              {t("app.login")}
            </Link>
          </div>
        </section>

        {/* Stats — big numbers, two-up + one-up grid */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <StatCard value="0" label={t("home.stat.sessions")} />
          <StatCard value="0" label={t("home.stat.minutes")} />
          <div className="col-span-2">
            <StatCard value="0" label={t("home.stat.streak")} wide />
          </div>
        </section>

        {/* Sections list */}
        <section className="mt-6 space-y-3">
          <p className="px-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{t("app.sections")}</p>
          <Row title={t("training.title")} description={t("training.subtitle")} to="/training" />
          <Row title={t("profile.title")} description={t("app.profile.description")} to="/profile" />
          <Row title={t("profile.notifications")} description={t("notif.body")} to="/profile" />
        </section>

        <div className="mt-auto pt-8">
          <Link
            to="/home"
            className="group flex items-center justify-between rounded-full border border-foreground/12 bg-foreground/[0.03] px-5 py-4 text-[14px] font-medium transition hover:bg-foreground/[0.06]"
          >
            <span>{t("app.open.home")}</span>
            <span className="flex items-center gap-1.5 text-muted-foreground transition group-hover:text-foreground">
              {t("common.continue")} <span aria-hidden>→</span>
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={
        "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[12.5px] font-medium tracking-tight transition " +
        (active
          ? "bg-foreground text-background"
          : "border border-foreground/15 text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </span>
  );
}

function StatCard({ value, label, wide }: { value: string; label: string; wide?: boolean }) {
  return (
    <div className={"rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-5 " + (wide ? "flex items-end justify-between" : "")}>
      <p className="text-[34px] font-semibold leading-none tracking-[-0.03em]">{value}</p>
      <p className={"text-[10px] uppercase tracking-[0.24em] text-muted-foreground " + (wide ? "" : "mt-3")}>{label}</p>
    </div>
  );
}

function Row({ title, description, to }: { title: string; description: string; to: "/training" | "/profile" }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-3xl border border-foreground/10 bg-foreground/[0.02] px-5 py-4 transition hover:bg-foreground/[0.06]"
    >
      <div className="flex-1">
        <p className="text-[15px] font-semibold tracking-tight">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground line-clamp-2">{description}</p>
      </div>
      <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}
