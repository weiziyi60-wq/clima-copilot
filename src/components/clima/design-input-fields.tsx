import { RangeSlider } from "@/components/clima/range-slider";
import type {
  DesignInputs,
  Greenery,
  Orientation,
  Shading,
  VentilationStrategy,
} from "@/lib/clima-scoring";

export const ORIENTATIONS: Orientation[] = [
  "North",
  "South",
  "East",
  "West",
  "Mixed / Multiple",
];
export const SHADINGS: Shading[] = ["None", "Horizontal", "Vertical", "Mixed"];
export const VENTILATIONS: VentilationStrategy[] = [
  "None",
  "Single-sided",
  "Cross ventilation",
];
export const GREENERY: Greenery[] = ["Low", "Medium", "High"];

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs tracking-wide text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export function FixedValue({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-glass-border bg-secondary px-4 py-2.5 text-sm text-foreground">
      <span>{value}</span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        Fixed
      </span>
    </div>
  );
}

export function Segmented<T extends string>({
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

/** The same parameter set used for Option A, reused for the Option B iteration. */
export function DesignInputFields({
  value,
  onChange,
}: {
  value: DesignInputs;
  onChange: (next: DesignInputs) => void;
}) {
  const set = <K extends keyof DesignInputs>(key: K, v: DesignInputs[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-5">
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
          value={value.orientation}
          onChange={(v) => set("orientation", v)}
          grid="grid-cols-2"
        />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs tracking-wide text-muted-foreground">
            Window-to-Wall Ratio
          </label>
          <span className="font-mono text-xs text-brand">{value.wwr}%</span>
        </div>
        <RangeSlider
          value={value.wwr}
          min={20}
          max={80}
          onChange={(v) => set("wwr", v)}
        />
      </div>

      <Field label="External Shading">
        <Segmented
          options={SHADINGS}
          value={value.shading}
          onChange={(v) => set("shading", v)}
          grid="grid-cols-4"
          compact
        />
      </Field>

      <Field label="Ventilation Strategy">
        <Segmented
          options={VENTILATIONS}
          value={value.ventilation}
          onChange={(v) => set("ventilation", v)}
          grid="grid-cols-3"
          compact
          labels={{ "Cross ventilation": "Cross" }}
        />
      </Field>

      <Field label="Greenery Integration">
        <Segmented
          options={GREENERY}
          value={value.greenery}
          onChange={(v) => set("greenery", v)}
          grid="grid-cols-3"
          compact
        />
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Greenery is recorded for future assessment modules and is not included in the
          current score.
        </p>
      </Field>
    </div>
  );
}
