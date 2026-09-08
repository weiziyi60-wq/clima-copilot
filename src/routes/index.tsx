import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/clima/aurora-background";
import { SiteHeader } from "@/components/clima/site-header";
import { SiteFooter } from "@/components/clima/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLIMA — AI Sustainable Design Copilot" },
      {
        name: "description",
        content:
          "Rapid, explainable sustainability feedback for early-stage architectural decisions. Design with climate, before simulation.",
      },
      { property: "og:title", content: "CLIMA — AI Sustainable Design Copilot" },
      {
        property: "og:description",
        content:
          "Rapid, explainable sustainability feedback for early-stage architectural decisions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndexPage,
});

const STEPS = [
  {
    no: "01",
    tone: "brand" as const,
    title: "Input design parameters",
    body: "Location, orientation and envelope — the levers you control on day one.",
  },
  {
    no: "02",
    tone: "brand-2" as const,
    title: "Analyse environmental performance",
    body: "Scores across solar, daylight, ventilation and energy potential.",
  },
  {
    no: "03",
    tone: "brand-3" as const,
    title: "Improve the design",
    body: "Explainable, ranked recommendations you can act on immediately.",
  },
];

const DIMENSIONS = [
  { name: "Solar Control", note: "Glare & heat gain" },
  { name: "Daylight Potential", note: "Useful illuminance" },
  { name: "Natural Ventilation Potential", note: "Airflow & comfort" },
  { name: "Envelope Strategy", note: "Thermal buffer" },
  { name: "Energy Potential", note: "Demand & yield" },
];

function IndexPage() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader variant="landing" />

        <main className="flex-1">
          {/* HERO */}
          <section className="mx-auto max-w-6xl px-6 pb-14 pt-12 text-center sm:pb-20 sm:pt-16 lg:px-10 lg:pt-24">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-brand">
              <span className="size-1.5 animate-pulse rounded-full bg-brand" />
              AI Sustainable Design Copilot
            </span>

            <h1 className="font-display mx-auto mt-7 max-w-4xl text-5xl leading-[1.05] tracking-tight text-foreground sm:mt-8 md:text-7xl">
              Design with{" "}
              <span className="clima-text-gradient">climate</span>, before
              simulation.
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-lg text-muted-foreground">
              Rapid, explainable sustainability feedback for early-stage
              architectural decisions.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
              <Link
                to="/dashboard"
                className="brand-gradient rounded-xl px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
              >
                Analyse a Design
              </Link>
              <a
                href="#how-it-works"
                className="glass rounded-xl px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:text-brand"
              >
                How it works
              </a>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              No simulation engine required · feedback in seconds
            </p>
          </section>

          {/* HOW IT WORKS */}
          <section
            id="how-it-works"
            className="mx-auto max-w-6xl px-6 py-16 lg:px-10"
          >
            <div className="mb-12 flex items-baseline justify-between border-t border-glass-border pt-8">
              <h2 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
                How the instrument works
              </h2>
              <span className="hidden text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
                Method
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.no} className="glass group rounded-2xl p-6 transition-transform hover:-translate-y-1">
                  <span
                    className={
                      "font-mono text-xs " +
                      (s.tone === "brand"
                        ? "text-brand"
                        : s.tone === "brand-2"
                          ? "text-brand-2"
                          : "text-brand-3")
                    }
                  >
                    {s.no}
                  </span>
                  <h3 className="mt-3 font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>

            {/* flow line */}
            <div className="mt-8 grid justify-center gap-1.5 text-xs text-foreground/70 sm:flex sm:items-center sm:gap-3">
              <span>Input design parameters <span className="ml-2 text-brand sm:hidden">↓</span></span>
              <span className="hidden text-brand sm:inline">→</span>
              <span>Analyse environmental performance <span className="ml-2 text-brand-2 sm:hidden">↓</span></span>
              <span className="hidden text-brand-2 sm:inline">→</span>
              <span>Improve the design</span>
            </div>
          </section>

          {/* DIMENSIONS PREVIEW */}
          <section
            id="dimensions"
            className="mx-auto max-w-6xl px-6 py-16 lg:px-10"
          >
            <div className="glass rounded-2xl p-7 md:p-10">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-brand">
                    Five climate dimensions
                  </p>
                  <h2 className="font-display mt-2 max-w-xl text-3xl tracking-tight text-foreground md:text-4xl">
                    A measured read of the site, before the model is built.
                  </h2>
                </div>
                <Link
                  to="/dashboard"
                  className="brand-gradient-soft shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
                >
                  Open dashboard →
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-glass-border md:grid-cols-5">
                {DIMENSIONS.map((d) => (
                  <div key={d.name} className="bg-card p-5">
                    <p className="text-sm font-semibold text-foreground">{d.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{d.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA BAND */}
          <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
            <div className="brand-gradient relative overflow-hidden rounded-3xl p-10 text-center md:p-16">
              <div className="grid-ticks absolute inset-0 opacity-30" aria-hidden />
              <div className="relative">
                <h2 className="font-display mx-auto max-w-2xl text-3xl tracking-tight text-ink md:text-5xl">
                  Design with climate, before simulation.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm text-ink/80">
                  Run an early-stage sustainability analysis in seconds — no
                  simulation engine required.
                </p>
                <Link
                  to="/dashboard"
                  className="mt-8 inline-flex rounded-xl bg-ink px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
                >
                  Analyse a Design
                </Link>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
