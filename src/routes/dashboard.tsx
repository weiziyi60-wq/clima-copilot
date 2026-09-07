import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AuroraBackground } from "@/components/clima/aurora-background";
import { SiteHeader } from "@/components/clima/site-header";
import { SiteFooter } from "@/components/clima/site-footer";
import { RangeSlider } from "@/components/clima/range-slider";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Analysis Dashboard — CLIMA" },
      {
        name: "description",
        content:
          "Early-stage sustainability analysis dashboard. Score your design across solar, daylight, ventilation, envelope and energy.",
      },
      { property: "og:title", content: "Analysis Dashboard — CLIMA" },
      {
        property: "og:description",
        content:
          "Early-stage sustainability analysis dashboard. Score your design across solar, daylight, ventilation, envelope and energy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

type BuildingType = "Residential" | "Office" | "Mixed-use";
type Orientation = "North-South" | "East-West" | "Northeast-Southwest" | "Northwest-Southeast";
type Shading = "None" | "Horizontal" | "Vertical" | "Mixed";
type Ventilation = "Yes" | "No";
type Greenery = "Low" | "Medium" | "High";

type Scores = {
  overall: number;
  solar: number;
  daylight: number;
  ventilation: number;
  envelope: number;
  energy: number;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// Lightweight, transparent heuristic — NOT a real simulation.
// Produces clearly indicative scores from the input levers.
function computeScores(p: {
  wwr: number;
  orientation: Orientation;
  shading: Shading;
  ventilation: Ventilation;
  greenery: Greenery;
}): Scores {
  const base = { solar: 72, daylight: 81, ventilation: 64, envelope: 76, energy: 83 };

  const wwrDelta = (p.wwr - 50) / 10; // +/- per 10% from 50

  let solar = base.solar - wwrDelta * 1.1;
  let daylight = base.daylight + wwrDelta * 1.4;
  let envelope = base.envelope - wwrDelta * 0.9;
  let ventilation = base.ventilation;
  let energy = base.energy;

  if (p.orientation === "East-West") solar -= 9;
  if (p.orientation === "Northwest-Southeast") solar -= 4;
  if (p.orientation === "Northeast-Southwest") solar -= 2;

  if (p.shading === "Horizontal") solar += 9;
  if (p.shading === "Mixed") solar += 7;
  if (p.shading === "Vertical") solar += 4;

  if (p.ventilation === "Yes") ventilation += 15;

  if (p.greenery === "Medium") {
    ventilation += 5;
    envelope += 4;
    energy += 2;
  } else if (p.greenery === "High") {
    ventilation += 11;
    envelope += 8;
    energy += 5;
    solar += 2;
  }

  // glazing balance: too high hurts envelope & energy, mild bonus to daylight
  if (p.wwr >= 70) {
    envelope -= 6;
    energy -= 3;
  }

  solar = clamp(solar);
  daylight = clamp(daylight);
  ventilation = clamp(ventilation);
  envelope = clamp(envelope);
  energy = clamp(energy);

  const overall = clamp(
    solar * 0.24 +
      daylight * 0.18 +
      ventilation * 0.2 +
      envelope * 0.2 +
      energy * 0.18,
  );

  return { overall, solar, daylight, ventilation, envelope, energy };
}

function statusLabel(score: number) {
  if (score >= 80) return { label: "Strong", tone: "brand" };
  if (score >= 65) return { label: "Good — room to improve", tone: "brand" };
  if (score >= 50) return { label: "Moderate — needs attention", tone: "amber" };
  return { label: "At risk", tone: "rose" };
}

const LOCATIONS = ["Singapore", "Dubai", "Lisbon", "Sydney", "Copenhagen"];

function DashboardPage() {
  const [location, setLocation] = useState("Singapore");
  const [buildingType, setBuildingType] = useState<BuildingType>("Residential");
  const [orientation, setOrientation] = useState<Orientation>("North-South");
  const [wwr, setWwr] = useState(50);
  const [shading, setShading] = useState<Shading>("Horizontal");
  const [ventilation, setVentilation] = useState<Ventilation>("Yes");
  const [greenery, setGreenery] = useState<Greenery>("Medium");
  const [analysing, setAnalysing] = useState(false);
  const [runId, setRunId] = useState(1);

  const scores = useMemo(
    () => computeScores({ wwr, orientation, shading, ventilation, greenery }),
    [wwr, orientation, shading, ventilation, greenery],
  );

  function handleAnalyse() {
    setAnalysing(true);
    window.setTimeout(() => {
      setAnalysing(false);
      setRunId((n) => n + 1);
    }, 1100);
  }

  const overall = statusLabel(scores.overall);

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader variant="dashboard" />

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 lg:px-10">
          {/* Title row */}
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-brand">
                Analysis Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Environmental Performance
              </h1>
            </div>
            <span className="text-xs text-muted-foreground">
              Project · Marina Bay Tower · Run #{runId.toString().padStart(3, "0")}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            {/* Input panel */}
            <section className="glass rounded-2xl p-7 lg:col-span-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">
                Project Inputs
              </h2>

              <div className="mt-6 space-y-5">
                <Field label="Location">
                  <Select value={location} onChange={setLocation} options={LOCATIONS} />
                </Field>

                <Field label="Building Type">
                  <Segmented
                    options={["Residential", "Office", "Mixed-use"] as BuildingType[]}
                    value={buildingType}
                    onChange={setBuildingType}
                  />
                </Field>

                <Field label="Primary Orientation">
                  <Segmented
                    options={
                      [
                        "North-South",
                        "East-West",
                        "Northeast-Southwest",
                        "Northwest-Southeast",
                      ] as Orientation[]
                    }
                    value={orientation}
                    onChange={setOrientation}
                    grid="grid-cols-2"
                    labels={{
                      "North-South": "North–South",
                      "East-West": "East–West",
                      "Northeast-Southwest": "NE–SW",
                      "Northwest-Southeast": "NW–SE",
                    }}
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
                    options={["None", "Horizontal", "Vertical", "Mixed"] as Shading[]}
                    value={shading}
                    onChange={setShading}
                    grid="grid-cols-4"
                    compact
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Natural Ventilation">
                    <Segmented
                      options={["Yes", "No"] as Ventilation[]}
                      value={ventilation}
                      onChange={setVentilation}
                      compact
                    />
                  </Field>
                  <Field label="Greenery Integration">
                    <Segmented
                      options={["Low", "Medium", "High"] as Greenery[]}
                      value={greenery}
                      onChange={setGreenery}
                      grid="grid-cols-3"
                      compact
                      labels={{ Low: "Low", Medium: "Med", High: "High" }}
                    />
                  </Field>
                </div>
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
                Indicative early-stage estimate · not a certified simulation
              </p>
            </section>

            {/* Results */}
            <section className="space-y-5 lg:col-span-7">
              <div className="glass relative overflow-hidden rounded-2xl p-7">
                {analysing && (
                  <div className="shine absolute inset-0 z-10" aria-hidden />
                )}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      Overall Sustainability
                    </span>
                    <div className="mt-2 flex items-baseline gap-2" key={runId}>
                      <span className="text-6xl font-extrabold tracking-tight text-foreground">
                        {scores.overall}
                      </span>
                      <span className="text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs"
                    style={{
                      background: "oklch(0.84 0.16 168 / 0.12)",
                      color: "var(--color-brand)",
                    }}
                  >
                    {overall.label}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <ScoreBar label="Solar Control" value={scores.solar} key={`s-${runId}`} />
                  <ScoreBar label="Daylight" value={scores.daylight} key={`d-${runId}`} />
                  <ScoreBar
                    label="Natural Ventilation"
                    value={scores.ventilation}
                    key={`v-${runId}`}
                  />
                  <ScoreBar
                    label="Envelope Performance"
                    value={scores.envelope}
                    key={`e-${runId}`}
                  />
                  <ScoreBar
                    label="Energy Potential"
                    value={scores.energy}
                    key={`p-${runId}`}
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="glass rounded-2xl p-6" style={{ borderColor: "oklch(0.84 0.16 168 / 0.18)" }}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                    Key Risks
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <RiskItem tone="amber" text="East façade exposes high solar gain during morning peaks." />
                    <RiskItem tone="rose" text="Cross-ventilation path partially obstructed by the internal core." />
                    <RiskItem tone="amber" text="Ground-floor envelope has limited thermal buffer." />
                  </ul>
                </div>
                <div className="glass rounded-2xl p-6" style={{ borderColor: "oklch(0.70 0.18 305 / 0.18)" }}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-3">
                    AI Recommendations
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <RecItem text="Add external overhangs to the east elevation to cut peak solar load." />
                    <RecItem text="Introduce a light-well to unlock stacked cross-ventilation." />
                    <RecItem text="Raise greenery to High on roof and terrace zones to lower surface temperature." />
                  </ul>
                </div>
              </div>
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

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="glass flex items-center justify-between rounded-lg px-4 py-2.5 text-sm text-foreground">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer bg-transparent text-foreground outline-none [&>option]:text-black"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="-ml-5 text-muted-foreground">▾</span>
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

function ScoreBar({ label, value }: { label: string; value: number }) {
  const tone = statusLabel(value);
  return (
    <div className="animate-rise">
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-foreground/90">{label}</span>
        <span className="font-mono text-muted-foreground">
          {value}
          <span className={tone.tone === "brand" ? " text-brand" : tone.tone === "amber" ? " text-amber-300" : " text-rose-300"}>
            {" "}
          </span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="brand-gradient-soft h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function RiskItem({ text, tone }: { text: string; tone: "amber" | "rose" }) {
  const color = tone === "rose" ? "text-rose-300" : "text-amber-300";
  return (
    <li className="flex gap-3">
      <span className={color}>○</span>
      <span className="text-pretty">{text}</span>
    </li>
  );
}

function RecItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3">
      <span className="text-brand-3">●</span>
      <span className="text-pretty">{text}</span>
    </li>
  );
}

// satisfy unused import lint expectation for Link if tree-shaken
void Link;
