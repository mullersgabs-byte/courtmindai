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
      <main className="mx-auto flex min-h-screen max-w-[480px] flex-col px-5 pb-8 pt-5">
        <header className="flex items-center justify-between py-2">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t("app.ready")}</p>
            <h1 className="mt-1 text-[30px] font-semibold leading-tight">CourtMind</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-[14px] font-medium text-foreground transition hover:bg-card"
            >
              {t("auth.title.signin")}
            </Link>
          </div>
        </header>

        <section className="mt-8 rounded-[2rem] border bg-card p-6 shadow-sm">
          <p className="text-[13px] font-medium text-muted-foreground">{t("home.title")}</p>
          <h2 className="mt-3 text-[34px] font-semibold leading-tight">{t("app.main.title")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{t("app.main.subtitle")}</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <Link
              to="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-[15px] font-medium text-background transition hover:opacity-90"
            >
              {t("app.start")}
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-12 items-center justify-center rounded-full border px-5 text-[15px] font-medium transition hover:bg-background"
            >
              {t("app.login")}
            </Link>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          <Stat value="0" label={t("home.stat.sessions")} />
          <Stat value="0" label={t("home.stat.minutes")} />
          <Stat value="0" label={t("home.stat.streak")} />
        </section>

        <section className="mt-6 space-y-3">
          <p className="px-1 text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{t("app.sections")}</p>
          <Feature title={t("training.title")} description={t("training.subtitle")} to="/training" />
          <Feature title={t("profile.title")} description={t("app.profile.description")} to="/profile" />
          <Feature title={t("profile.notifications")} description={t("notif.body")} to="/profile" />
        </section>

        <div className="mt-auto pt-8">
          <Link
            to="/home"
            className="flex items-center justify-between rounded-3xl border bg-card px-5 py-4 text-[15px] font-medium transition hover:bg-background"
          >
            <span>{t("app.open.home")}</span>
            <span className="text-muted-foreground">{t("common.continue")}</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border bg-card p-4 text-center">
      <p className="text-[24px] font-semibold leading-none">{value}</p>
      <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Feature({ title, description, to }: { title: string; description: string; to: "/training" | "/profile" }) {
  return (
    <Link to={to} className="block rounded-3xl border bg-card px-5 py-4 transition hover:bg-background">
      <p className="text-[16px] font-semibold">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
    </Link>
  );
}
