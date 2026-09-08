import { useState } from "react";
import { DesignInputFields } from "@/components/clima/design-input-fields";
import { compareDesigns, formatDelta, type Comparison } from "@/lib/clima-compare";
import type { DesignInputs } from "@/lib/clima-scoring";

/**
 * Deterministic comparison layer. Both options are scored by the untouched
 * engine in src/lib/clima-scoring.ts via compareDesigns(). No AI involved.
 */
export function ComparePanel({
  baseInputs,
  onComparison,
}: {
  baseInputs: DesignInputs;
  onComparison: (c: Comparison | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [optionB, setOptionB] = useState<DesignInputs>(baseInputs);
  const [comparison, setComparison] = useState<Comparison | null>(null);

  function start() {
    setOptionB(baseInputs);
    setComparison(null);
    onComparison(null);
    setOpen(true);
  }

  function evaluate() {
    const c = compareDesigns(baseInputs, optionB);
    setComparison(c);
    onComparison(c);
  }

  function reset() {
    setOpen(false);
    setComparison(null);
    onComparison(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={start}
        className="glass w-full rounded-2xl px-6 py-4 text-sm font-medium text-foreground transition-colors hover:border-brand/40"
      >
        Compare Design
        <span className="ml-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Design → Assess → Iterate → Compare → Decide
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-brand">Option B</p>
            <h3 className="font-display mt-1 text-2xl text-foreground">Design Iteration</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Pre-filled with Option A (existing design). Change only the parameters you
              want to test.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="mt-6">
          <DesignInputFields value={optionB} onChange={setOptionB} />
        </div>

        <button
          type="button"
          onClick={evaluate}
          className="brand-gradient mt-7 w-full rounded-xl py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          Evaluate Option B
        </button>
      </div>

      {comparison && <ComparisonResults c={comparison} />}
    </div>
  );
}

function ComparisonResults({ c }: { c: Comparison }) {
  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-7">
        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
          Comparison
        </h3>

        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <OptionScore
            tag="Option A"
            name="Existing Design"
            score={c.a.overall}
            classification={c.a.classification}
          />
          <div className="hidden h-full w-px bg-glass-border sm:block" />
          <OptionScore
            tag="Option B"
            name="Design Iteration"
            score={c.b.overall}
            classification={c.b.classification}
          />
        </div>

        <div className="mt-6 border-t border-glass-border pt-5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Difference
          </span>
          <p className="font-display mt-1 text-3xl tracking-tight text-foreground">
            {formatDelta(c.overallDelta)}
            {c.overallDelta !== 0 && (
              <span className="ml-2 text-sm text-muted-foreground">points</span>
            )}
          </p>
        </div>

        <div className="mt-7 space-y-3">
          {c.categories.map((cat) => (
            <div
              key={cat.key}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-glass-border pt-3 text-sm"
            >
              <span className="text-foreground/90">{cat.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                <span className="text-foreground">{cat.a}</span>
                <span className="mx-2">→</span>
                <span className="text-foreground">{cat.b}</span>
                <span className="ml-1">/ {cat.max}</span>
                <span
                  className="ml-4 inline-block min-w-14 text-right"
                  style={{
                    color:
                      cat.delta === 0
                        ? "var(--color-muted-foreground)"
                        : cat.delta > 0
                          ? "var(--color-brand)"
                          : "oklch(0.48 0.14 40)",
                  }}
                >
                  {formatDelta(cat.delta)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
            What changed
          </h3>
          {c.changes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No parameters were changed between the two options.
            </p>
          ) : (
            <dl className="mt-4 space-y-3 text-sm">
              {c.changes.map((ch) => (
                <div
                  key={ch.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                >
                  <dt className="text-foreground/90">{ch.label}</dt>
                  <dd className="font-mono text-xs text-muted-foreground">
                    {ch.from} <span className="mx-1">→</span>{" "}
                    <span className="text-foreground">{ch.to}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div
          className="glass rounded-2xl p-6"
          style={{ borderColor: "oklch(0.50 0.055 130 / 0.28)" }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-3">
            Why Option B performs differently
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {c.interpretation.map((text) => (
              <li key={text} className="flex gap-3">
                <span className="mt-2 h-px w-4 shrink-0 bg-brand/60" />
                <span className="text-pretty">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function OptionScore({
  tag,
  name,
  score,
  classification,
}: {
  tag: string;
  name: string;
  score: number;
  classification: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{tag}</p>
      <p className="mt-1 text-sm text-foreground/90">{name}</p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Climate Responsiveness Score
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-5xl tracking-tight text-foreground">{score}</span>
        <span className="text-muted-foreground">/ 100</span>
      </div>
      <span
        className="mt-3 inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
        style={{
          background: "oklch(0.44 0.075 155 / 0.09)",
          color: "var(--color-brand)",
        }}
      >
        {classification}
      </span>
    </div>
  );
}
