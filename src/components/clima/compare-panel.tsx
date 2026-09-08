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
        className="glass grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:border-brand/40 sm:flex sm:justify-center sm:text-center"
      >
        <span className="min-w-0">Compare Design</span>
        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
          Option A → Option B
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="glass rounded-2xl p-5 sm:p-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.25em] text-brand">Option B</p>
            <h3 className="font-display mt-1 text-2xl text-foreground">Design Iteration</h3>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              Starts with Option A. Change only what you want to test.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Close
          </button>
        </div>

        <div className="mt-5">
          <DesignInputFields value={optionB} onChange={setOptionB} />
        </div>

        <button
          type="button"
          onClick={evaluate}
          className="brand-gradient mt-6 w-full rounded-xl py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
        >
          Analyse Option B
        </button>
      </div>

      {comparison && <ComparisonResults c={comparison} />}
    </div>
  );
}

function ComparisonResults({ c }: { c: Comparison }) {
  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5 sm:p-7">
        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
          Comparison
        </h3>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-7">
          <OptionScore
            tag="Option A"
            name="Existing Design"
            score={c.a.overall}
            classification={c.a.classification}
          />
          <div className="flex h-full min-h-28 shrink-0 items-center text-xl text-brand sm:text-2xl" aria-hidden>
            →
          </div>
          <OptionScore
            tag="Option B"
            name="Design Iteration"
            score={c.b.overall}
            classification={c.b.classification}
          />
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-y border-glass-border py-4">
          <span className="min-w-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Score difference
          </span>
          <p className="font-display shrink-0 text-4xl leading-none text-brand sm:text-5xl">
            {formatDelta(c.overallDelta)}
            {c.overallDelta !== 0 && <span className="ml-2 text-sm text-muted-foreground">points</span>}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {c.categories.map((cat) => (
            <div
              key={cat.key}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-t border-glass-border pt-2.5 text-sm"
            >
              <span className="min-w-0 text-foreground/90">{cat.label}</span>
              <span className="shrink-0 whitespace-nowrap font-mono text-xs text-muted-foreground">
                <span className="text-foreground">{cat.a}</span>
                <span className="mx-2">→</span>
                <span className="text-foreground">{cat.b}</span>
                <span className="ml-1">/ {cat.max}</span>
                <span
                   className="ml-2 inline-block min-w-12 text-right sm:ml-4 sm:min-w-14"
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
        <div className="glass rounded-2xl p-5 sm:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
            What changed
          </h3>
          {c.changes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No parameters were changed between the two options.
            </p>
          ) : (
            <dl className="mt-4 divide-y divide-glass-border text-sm">
              {c.changes.map((ch) => (
                <div
                  key={ch.label}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <dt className="min-w-0 text-foreground/90">{ch.label}</dt>
                  <dd className="shrink-0 whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {ch.from} <span className="mx-1">→</span>{" "}
                    <span className="text-foreground">{ch.to}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div
          className="glass rounded-2xl p-5 sm:p-6"
          style={{ borderColor: "oklch(0.50 0.055 130 / 0.28)" }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-3">
            Why Option B performs differently
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
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
    <div className="min-w-0 text-center">
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{tag}</p>
      <p className="mt-1 truncate text-xs text-foreground/90 sm:text-sm">{name}</p>
      <div className="mt-2 flex items-baseline justify-center gap-1 sm:mt-3 sm:gap-2">
        <span className="font-display text-5xl leading-none text-foreground sm:text-6xl">{score}</span>
        <span className="text-xs text-muted-foreground sm:text-sm">/ 100</span>
      </div>
      <span
        className="mt-3 inline-block max-w-full text-balance text-[9px] uppercase leading-relaxed tracking-[0.12em] text-brand sm:text-[10px] sm:tracking-[0.16em]"
        style={{
          color: "var(--color-brand)",
        }}
      >
        {classification}
      </span>
    </div>
  );
}
