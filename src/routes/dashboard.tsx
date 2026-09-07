import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuroraBackground } from "@/components/clima/aurora-background";
import { SiteHeader } from "@/components/clima/site-header";
import { SiteFooter } from "@/components/clima/site-footer";
import { RangeSlider } from "@/components/clima/range-slider";
import { AskClima } from "@/components/clima/ask-clima";

import {
  MAX,
  METHODOLOGY_DISCLAIMER,
  scoreDesign,
  type DesignInputs,
  type Greenery,
  type Orientation,
  type ScoreResult,
  type Shading,
  type VentilationStrategy,
} from "@/lib/clima-scoring";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Analysis Dashboard — CLIMA" },
      {
        name: "description",
        content:
          "Early-stage sustainability analysis for Singapore residential design. Transparent, rule-based scoring across solar control, daylight, ventilation, envelope and energy potential.",
      },
      { property: "og:title", content: "Analysis Dashboard — CLIMA" },
      {
        property: "og:description",
        content:
          "Transparent, rule-based early-stage sustainability scoring for Singapore residential design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const ORIENTATIONS: Orientation[] = ["North", "South", "East", "West", "Mixed / Multiple"];
const SHADINGS: Shading[] = ["None", "Horizontal", "Vertical", "Mixed"];
const VENTILATIONS: VentilationStrategy[] = ["None", "Single-sided", "Cross ventilation"];
const GREENERY: Greenery[] = ["Low", "Medium", "High"];

function DashboardPage() {
  const [orientation, setOrientation] = useState<Orientation>("North");
  const [wwr, setWwr] = useState(50);
  const [shading, setShading] = useState<Shading>("Horizontal");
  const [ventilation, setVentilation] = useState<VentilationStrategy>("Cross ventilation");
  const [greenery, setGreenery] = useState<Greenery>("Medium");

  const [result, setResult] = useState<ScoreResult | null>(null);
  const [analysedInputs, setAnalysedInputs] = useState<DesignInputs | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [runId, setRunId] = useState(0);

  function handleAnalyse() {
    const inputs: DesignInputs = { orientation, wwr, shading, ventilation, greenery };
    setAnalysing(true);
    window.setTimeout(() => {
      setResult(scoreDesign(inputs));
      setAnalysedInputs(inputs);

      setRunId((n) => n + 1);
      setAnalysing(false);
    }, 650);
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader variant="dashboard" />

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 lg:px-10">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-brand">
                Analysis Dashboard · V0.1
              </p>
              <h1 className="font-display mt-2 text-4xl tracking-tight text-foreground sm:text-5xl">
                Environmental Performance
              </h1>
            </div>
            <span className="text-xs text-muted-foreground">
              Singapore · Residential · Run #{runId.toString().padStart(3, "0")}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            {/* Inputs */}
            <section className="glass rounded-2xl p-7 lg:col-span-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
                Project Inputs
              </h2>

              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Location">
                    <FixedValue value="Singapore" />
                  </Field>
                  <Field label="Building Type">
                    <FixedValue value="Residential" />
                  </Field>
                </div>

                <Field label="Primary Glazed Façade Orientation">
                  <Segmented
                    options={ORIENTATIONS}
                    value={orientation}
                    onChange={setOrientation}
                    grid="grid-cols-2"
                    labels={{ "Mixed / Multiple": "Mixed / Multiple" }}
                  />
                </Field>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs tracking-wide text-muted-foreground">
                      Window-to-Wall Ratio
                    </label>
                    <span className="font-mono text-xs text-brand">{wwr}%</span>
                  </div>
                  <RangeSlider value={wwr} min={20} max={80} onChange={setWwr} />
                </div>

                <Field label="External Shading">
                  <Segmented
                    options={SHADINGS}
                    value={shading}
                    onChange={setShading}
                    grid="grid-cols-4"
                    compact
                  />
                </Field>

                <Field label="Ventilation Strategy">
                  <Segmented
                    options={VENTILATIONS}
                    value={ventilation}
                    onChange={setVentilation}
                    grid="grid-cols-3"
                    compact
                    labels={{ "Cross ventilation": "Cross" }}
                  />
                </Field>

                <Field label="Greenery Integration">
                  <Segmented
                    options={GREENERY}
                    value={greenery}
                    onChange={setGreenery}
                    grid="grid-cols-3"
                    compact
                  />
                  <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                    Greenery is recorded for future assessment modules and is not included
                    in the current score.
                  </p>
                </Field>
              </div>

              <button
                onClick={handleAnalyse}
                disabled={analysing}
                className="brand-gradient mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-progress disabled:opacity-70"
              >
                {analysing ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                    Analysing…
                  </>
                ) : (
                  <>Analyse Design</>
                )}
              </button>
              <p className="mt-3 text-center text-[10px] text-muted-foreground">
                Deterministic rule-based assessment · not a certified simulation
              </p>
            </section>

            {/* Results */}
            <section className="space-y-5 lg:col-span-7">
              {result === null ? (
                <div className="glass flex min-h-[420px] flex-col items-center justify-center rounded-2xl p-10 text-center">
                  <span className="grid-ticks mb-6 size-20 rounded-xl border border-glass-border" />
                  <h2 className="font-display text-2xl text-foreground">
                    Awaiting analysis
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Set the façade parameters and run the assessment to see the
                    climate-responsive score breakdown.
                  </p>
                </div>
              ) : (
                <>
                  <div className="glass relative overflow-hidden rounded-2xl p-7">
                    {analysing && <div className="shine absolute inset-0 z-10" aria-hidden />}
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                          Climate Responsiveness Score
                        </span>
                        <div className="mt-2 flex items-baseline gap-2" key={runId}>
                          <span className="font-display text-6xl tracking-tight text-foreground">
                            {result.overall}
                          </span>
                          <span className="text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                        style={{
                          background: "oklch(0.44 0.075 155 / 0.09)",
                          color: "var(--color-brand)",
                        }}
                      >
                        {result.classification}
                      </span>
                    </div>

                    <div className="mt-7 space-y-4">
                      <ScoreBar
                        label="Solar Control"
                        value={result.solarControl}
                        max={MAX.solarControl}
                        key={`s-${runId}`}
                      />
                      <ScoreBar
                        label="Daylight Potential"
                        value={result.daylight}
                        max={MAX.daylight}
                        key={`d-${runId}`}
                      />
                      <ScoreBar
                        label="Natural Ventilation Potential"
                        value={result.ventilation}
                        max={MAX.ventilation}
                        key={`v-${runId}`}
                      />
                      <ScoreBar
                        label="Envelope Strategy"
                        value={result.envelope}
                        max={MAX.envelope}
                        key={`e-${runId}`}
                      />
                      <ScoreBar
                        label="Energy Potential"
                        value={result.energy}
                        max={MAX.energy}
                        key={`p-${runId}`}
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div
                      className="glass rounded-2xl p-6"
                      style={{ borderColor: "oklch(0.44 0.075 155 / 0.28)" }}
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                        Why this score?
                      </h3>
                      <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {result.explanations.map((text) => (
                          <li key={text} className="flex gap-3">
                            <span className="mt-2 h-px w-4 shrink-0 bg-brand/60" />
                            <span className="text-pretty">{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className="glass rounded-2xl p-6"
                      style={{ borderColor: "oklch(0.50 0.055 130 / 0.28)" }}
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-3">
                        Top priority actions
                      </h3>
                      {result.actions.length === 0 ? (
                        <p className="mt-4 text-sm text-muted-foreground">
                          No priority actions identified — the current parameter set is
                          already well balanced for this climate.
                        </p>
                      ) : (
                        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                          {result.actions.map((text, idx) => (
                            <li key={text} className="flex gap-3">
                              <span className="font-mono text-[11px] text-brand-3">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className="text-pretty">{text}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>

                  {analysedInputs && <AskClima inputs={analysedInputs} result={result} />}

                  <p className="border-t border-glass-border pt-5 text-[11px] leading-relaxed text-muted-foreground">
                    {METHODOLOGY_DISCLAIMER}
                  </p>

                </>
              )}
            </section>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs tracking-wide text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function FixedValue({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-glass-border bg-secondary px-4 py-2.5 text-sm text-foreground">
      <span>{value}</span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        Fixed
      </span>
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  grid = "grid-cols-3",
  compact = false,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  grid?: string;
  compact?: boolean;
  labels?: Partial<Record<T, string>>;
}) {
  return (
    <div className={`grid gap-2 ${grid}`}>
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={
              active
                ? `brand-gradient-soft rounded-lg ${compact ? "py-1.5" : "py-2"} text-[11px] font-medium text-ink ring-1 ring-brand/40`
                : `glass rounded-lg ${compact ? "py-1.5" : "py-2"} text-[11px] text-muted-foreground transition-colors hover:text-foreground`
            }
          >
            {labels?.[o] ?? o}
          </button>
        );
      })}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="animate-rise">
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="text-foreground/90">{label}</span>
        <span className="font-mono text-muted-foreground">
          <span className="text-foreground">{value}</span> / {max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="brand-gradient-soft h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
