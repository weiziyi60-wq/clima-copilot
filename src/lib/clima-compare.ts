/**
 * CLIMA V0.3 — deterministic design-option comparison.
 *
 * This module contains NO scoring rules of its own. Both options are scored by
 * the untouched engine in src/lib/clima-scoring.ts; everything here is a pure
 * diff and a rule-based narration of that diff. No LLM is involved.
 */

import { MAX, scoreDesign, type DesignInputs, type ScoreResult } from "@/lib/clima-scoring";

export type CategoryKey = "solarControl" | "daylight" | "ventilation" | "envelope" | "energy";

export type CategoryDelta = {
  key: CategoryKey;
  label: string;
  max: number;
  a: number;
  b: number;
  delta: number;
};

export type InputChange = {
  label: string;
  from: string;
  to: string;
};

export type Comparison = {
  inputsA: DesignInputs;
  inputsB: DesignInputs;
  a: ScoreResult;
  b: ScoreResult;
  overallDelta: number;
  categories: CategoryDelta[];
  changes: InputChange[];
  interpretation: string[];
};

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "solarControl", label: "Solar Control" },
  { key: "daylight", label: "Daylight Potential" },
  { key: "ventilation", label: "Natural Ventilation Potential" },
  { key: "envelope", label: "Envelope Strategy" },
  { key: "energy", label: "Energy Potential" },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

export function diffInputs(a: DesignInputs, b: DesignInputs): InputChange[] {
  const changes: InputChange[] = [];
  if (a.orientation !== b.orientation)
    changes.push({
      label: "Primary Glazed Façade Orientation",
      from: a.orientation,
      to: b.orientation,
    });
  if (a.wwr !== b.wwr)
    changes.push({ label: "Window-to-Wall Ratio", from: `${a.wwr}%`, to: `${b.wwr}%` });
  if (a.shading !== b.shading)
    changes.push({ label: "External Shading", from: a.shading, to: b.shading });
  if (a.ventilation !== b.ventilation)
    changes.push({ label: "Ventilation Strategy", from: a.ventilation, to: b.ventilation });
  if (a.greenery !== b.greenery)
    changes.push({
      label: "Greenery Integration",
      from: a.greenery,
      to: b.greenery,
    });
  return changes;
}

/** Which changed parameters feed a given scoring category (per the V0.1 rules). */
const DRIVERS: Record<CategoryKey, string[]> = {
  solarControl: ["Primary Glazed Façade Orientation", "Window-to-Wall Ratio", "External Shading"],
  daylight: ["Window-to-Wall Ratio", "External Shading"],
  ventilation: ["Ventilation Strategy", "Primary Glazed Façade Orientation"],
  envelope: ["Window-to-Wall Ratio", "External Shading", "Primary Glazed Façade Orientation"],
  energy: [
    "Window-to-Wall Ratio",
    "External Shading",
    "Primary Glazed Façade Orientation",
    "Ventilation Strategy",
  ],
};

function phrase(change: InputChange) {
  return `${change.label.toLowerCase()} (${change.from} → ${change.to})`;
}

function buildInterpretation(
  categories: CategoryDelta[],
  changes: InputChange[],
  overallDelta: number,
): string[] {
  const out: string[] = [];

  if (changes.length === 0) {
    return ["Option B uses the same parameters as Option A, so the result is identical."];
  }

  const scoring = changes.filter((c) => c.label !== "Greenery Integration");
  if (scoring.length === 0) {
    return [
      "Only greenery integration changed. Greenery is recorded for future assessment modules and is excluded from the current score, so the result is unchanged.",
    ];
  }

  if (overallDelta > 0) {
    out.push(
      `Option B scores ${round1(overallDelta)} points higher overall, driven by ${scoring
        .map(phrase)
        .join(", ")}.`,
    );
  } else if (overallDelta < 0) {
    out.push(
      `Option B scores ${round1(Math.abs(overallDelta))} points lower overall, following ${scoring
        .map(phrase)
        .join(", ")}.`,
    );
  } else {
    out.push(
      `Overall the two options score the same, although ${scoring
        .map(phrase)
        .join(", ")} redistributes performance between categories.`,
    );
  }

  const moved = categories
    .filter((c) => c.delta !== 0)
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));

  for (const cat of moved.slice(0, 3)) {
    const drivers = scoring.filter((c) => DRIVERS[cat.key].includes(c.label));
    const because = drivers.length
      ? ` This category responds to ${drivers.map((d) => d.label.toLowerCase()).join(" and ")}.`
      : cat.key === "energy"
        ? " Energy potential is derived from the other four categories."
        : "";
    out.push(
      `${cat.label} moves from ${cat.a} to ${cat.b} out of ${cat.max} (${
        cat.delta > 0 ? "+" : ""
      }${round1(cat.delta)}).${because}`,
    );
  }

  const losses = moved.filter((c) => c.delta < 0);
  if (losses.length && overallDelta > 0) {
    out.push(
      `Note the trade-off: ${losses
        .map((l) => l.label.toLowerCase())
        .join(" and ")} weakens while the overall result improves.`,
    );
  }

  out.push(
    "These are rule-based comparisons of early-stage design parameters. They are not simulated energy, thermal comfort, carbon or certification outcomes.",
  );

  return out;
}

export function compareDesigns(a: DesignInputs, b: DesignInputs): Comparison {
  const resultA = scoreDesign(a);
  const resultB = scoreDesign(b);

  const categories: CategoryDelta[] = CATEGORIES.map(({ key, label }) => ({
    key,
    label,
    max: MAX[key],
    a: resultA[key],
    b: resultB[key],
    delta: round1(resultB[key] - resultA[key]),
  }));

  const overallDelta = resultB.overall - resultA.overall;
  const changes = diffInputs(a, b);

  return {
    inputsA: a,
    inputsB: b,
    a: resultA,
    b: resultB,
    overallDelta,
    categories,
    changes,
    interpretation: buildInterpretation(categories, changes, overallDelta),
  };
}

export function formatDelta(n: number): string {
  if (n === 0) return "No change";
  const v = round1(Math.abs(n));
  return `${n > 0 ? "+" : "−"}${v}`;
}
