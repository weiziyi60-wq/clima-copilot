/**
 * CLIMA V0.1 — transparent, rule-based early-stage scoring engine.
 * Scope: Singapore, residential.
 *
 * This is NOT a simulation, regulatory assessment or Green Mark calculator.
 * Every number below comes from an explicit lookup table so the rules stay
 * easy to audit and easy to change.
 */

export type Orientation = "North" | "South" | "East" | "West" | "Mixed / Multiple";
export type Shading = "None" | "Horizontal" | "Vertical" | "Mixed";
export type VentilationStrategy = "None" | "Single-sided" | "Cross ventilation";
export type Greenery = "Low" | "Medium" | "High";

export type DesignInputs = {
  orientation: Orientation;
  wwr: number;
  shading: Shading;
  ventilation: VentilationStrategy;
  /** Recorded only — deliberately excluded from the V0.1 score. */
  greenery: Greenery;
};

export type Classification =
  | "CLIMATE RESPONSIVE"
  | "GOOD POTENTIAL"
  | "NEEDS IMPROVEMENT"
  | "HIGH CLIMATE RISK";

export type ScoreResult = {
  solarControl: number;
  daylight: number;
  ventilation: number;
  envelope: number;
  energy: number;
  overall: number;
  classification: Classification;
  explanations: string[];
  actions: string[];
};

export const MAX = {
  solarControl: 25,
  daylight: 20,
  ventilation: 20,
  envelope: 20,
  energy: 15,
} as const;

/* ---------------- A. Solar control (25) ---------------- */

const SOLAR_ORIENTATION: Record<Orientation, number> = {
  North: 8,
  South: 8,
  East: 3,
  West: 2,
  "Mixed / Multiple": 5,
};

function solarWwrScore(wwr: number): number {
  if (wwr <= 40) return 9;
  if (wwr <= 50) return 8;
  if (wwr <= 60) return 6;
  if (wwr <= 70) return 3;
  return 1;
}

const SOLAR_SHADING: Record<Shading, number> = {
  Mixed: 8,
  Horizontal: 6,
  Vertical: 6,
  None: 0,
};

/* ---------------- B. Daylight potential (20) ---------------- */

function daylightBase(wwr: number): number {
  if (wwr <= 24) return 8;
  if (wwr <= 40) return 15;
  if (wwr <= 60) return 18;
  if (wwr <= 70) return 15;
  return 11;
}

/* ---------------- C. Natural ventilation potential (20) ---------------- */

const VENTILATION_BASE: Record<VentilationStrategy, number> = {
  None: 3,
  "Single-sided": 10,
  "Cross ventilation": 16,
};

const VENTILATION_ORIENTATION: Record<Orientation, number> = {
  North: 4,
  South: 4,
  East: 2,
  West: 1,
  "Mixed / Multiple": 3,
};

/* ---------------- D. Envelope strategy (20) ---------------- */

function envelopeWwrScore(wwr: number): number {
  if (wwr <= 40) return 10;
  if (wwr <= 50) return 9;
  if (wwr <= 60) return 7;
  if (wwr <= 70) return 4;
  return 2;
}

const ENVELOPE_SHADING: Record<Shading, number> = {
  Mixed: 7,
  Horizontal: 5,
  Vertical: 5,
  None: 0,
};

const ENVELOPE_ORIENTATION: Record<Orientation, number> = {
  North: 3,
  South: 3,
  East: 1,
  West: 0,
  "Mixed / Multiple": 2,
};

/* ---------------- Helpers ---------------- */

const cap = (value: number, max: number) => Math.min(value, max);
const round1 = (n: number) => Math.round(n * 10) / 10;

export function classify(overall: number): Classification {
  if (overall >= 85) return "CLIMATE RESPONSIVE";
  if (overall >= 70) return "GOOD POTENTIAL";
  if (overall >= 50) return "NEEDS IMPROVEMENT";
  return "HIGH CLIMATE RISK";
}

/* ---------------- E. Explainability ---------------- */

function buildExplanations(i: DesignInputs): string[] {
  const out: string[] = [];

  if (i.wwr > 60) {
    out.push("High glazing ratio increases solar exposure and envelope sensitivity.");
  } else if (i.wwr >= 25 && i.wwr <= 50) {
    out.push(
      "Moderate glazing ratio provides a balanced starting point for daylight and solar control.",
    );
  } else if (i.wwr < 25) {
    out.push("Low glazing ratio limits solar gain but also limits useful daylight.");
  } else {
    out.push("Glazing ratio is above the balanced range and begins to load the façade.");
  }

  if (i.orientation === "East" || i.orientation === "West") {
    out.push(
      "East- or west-facing glazing is more exposed to low-angle morning or afternoon solar radiation.",
    );
  } else if (i.orientation === "North" || i.orientation === "South") {
    out.push(
      "North- or south-facing glazing avoids the harshest low-angle sun in the Singapore context.",
    );
  } else {
    out.push(
      "Glazing distributed across multiple orientations spreads exposure and requires façade-specific treatment.",
    );
  }

  if (i.shading === "None") {
    out.push("No external shading is currently provided for exposed glazing.");
  } else {
    out.push("External shading improves solar protection at the façade.");
  }

  if (i.ventilation === "Cross ventilation") {
    out.push("Cross-ventilation strategy strengthens passive cooling potential.");
  } else if (i.ventilation === "Single-sided") {
    out.push("Single-sided ventilation offers limited passive cooling potential.");
  } else {
    out.push("No intentional natural ventilation strategy is currently identified.");
  }

  return out;
}

/* ---------------- F. Priority actions ---------------- */

function buildActions(i: DesignInputs): string[] {
  // Ordered by weakness: each candidate carries a penalty weight so the three
  // most consequential actions surface first.
  const candidates: { weight: number; text: string }[] = [];

  if (i.wwr > 60) {
    candidates.push({
      weight: 10,
      text: "Reduce WWR toward approximately 40–50% and reassess façade performance.",
    });
  } else if (i.wwr > 50) {
    candidates.push({
      weight: 5,
      text: "Test a slightly lower WWR near 40–50% to relieve the envelope without losing daylight.",
    });
  }

  if (i.shading === "None") {
    candidates.push({ weight: 9, text: "Introduce façade-specific external shading." });
  } else if (i.shading !== "Mixed") {
    candidates.push({
      weight: 3,
      text: "Consider combining horizontal and vertical shading devices per façade exposure.",
    });
  }

  if (i.orientation === "East" || i.orientation === "West") {
    candidates.push({
      weight: 8,
      text: "Prioritise solar protection for east- and west-facing glazing.",
    });
  } else if (i.orientation === "Mixed / Multiple") {
    candidates.push({
      weight: 4,
      text: "Differentiate the shading approach on each orientation rather than applying one façade type.",
    });
  }

  if (i.ventilation === "None") {
    candidates.push({
      weight: 9,
      text: "Explore cross-ventilation opportunities where programme and building geometry permit.",
    });
  } else if (i.ventilation === "Single-sided") {
    candidates.push({
      weight: 6,
      text: "Investigate whether cross-ventilation can be enabled through plan configuration.",
    });
  }

  if (i.wwr < 25) {
    candidates.push({
      weight: 4,
      text: "Increase glazing modestly toward 25–40% to recover useful daylight.",
    });
  }

  return candidates
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((c) => c.text);
}

/* ---------------- Engine ---------------- */

export function scoreDesign(inputs: DesignInputs): ScoreResult {
  const solarControl = cap(
    SOLAR_ORIENTATION[inputs.orientation] +
      solarWwrScore(inputs.wwr) +
      SOLAR_SHADING[inputs.shading],
    MAX.solarControl,
  );

  const daylight = cap(
    daylightBase(inputs.wwr) + (inputs.shading === "None" ? 0 : 2),
    MAX.daylight,
  );

  const ventilation = cap(
    VENTILATION_BASE[inputs.ventilation] + VENTILATION_ORIENTATION[inputs.orientation],
    MAX.ventilation,
  );

  const envelope = cap(
    envelopeWwrScore(inputs.wwr) +
      ENVELOPE_SHADING[inputs.shading] +
      ENVELOPE_ORIENTATION[inputs.orientation],
    MAX.envelope,
  );

  const energy = round1(
    15 *
      ((solarControl / MAX.solarControl) * 0.35 +
        (envelope / MAX.envelope) * 0.35 +
        (ventilation / MAX.ventilation) * 0.2 +
        (daylight / MAX.daylight) * 0.1),
  );

  const overall = Math.round(solarControl + daylight + ventilation + envelope + energy);

  return {
    solarControl,
    daylight,
    ventilation,
    envelope,
    energy,
    overall,
    classification: classify(overall),
    explanations: buildExplanations(inputs),
    actions: buildActions(inputs),
  };
}

export const METHODOLOGY_DISCLAIMER =
  "CLIMA is an early-stage heuristic climate-responsive design assessment for exploration and comparison. It is not a building performance simulation, regulatory assessment, or Green Mark certification tool, and does not predict actual energy, carbon, daylight, thermal comfort, or cooling-load performance.";
