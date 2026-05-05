import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { I18nProvider, useT } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { LanguageGate } from "@/components/LanguageGate";
import { Toaster } from "sonner";

function NotFoundComponent() {
  const { t } = useT();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-medium tracking-tight text-platinum-gradient">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t("notfound.title")}</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-ink transition hover:opacity-90">
            {t("notfound.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CourtMind Elite — Train Smarter. Perform Better." },
      { name: "description", content: "AI-powered analysis for real athletes. An elite performance system." },
      { name: "theme-color", content: "#0B0B0B" },
      { property: "og:title", content: "CourtMind Elite" },
      { property: "og:description", content: "AI-powered analysis for real athletes." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: () => (
    <ThemeProvider>
      <I18nProvider>
        <LanguageGate>
          <Outlet />
          <Toaster
            position="top-center"
            theme="system"
            toastOptions={{
              style: {
                background: "var(--popover)",
                color: "var(--popover-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                fontSize: "13px",
              },
            }}
          />
        </LanguageGate>
      </I18nProvider>
    </ThemeProvider>
  ),
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}
