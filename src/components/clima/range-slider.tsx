type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
};

export function RangeSlider({ value, min, max, step = 1, onChange }: Props) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="mt-3">
      <div className="relative h-1.5 rounded-full bg-foreground/10">
        <div
          className="brand-gradient-soft absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-[0_1px_4px_rgba(0,0,0,0.18)] ring-2 ring-brand"
          style={{ left: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="clima-range absolute inset-0 h-full w-full"
          aria-label="Window-to-wall ratio"
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>{min}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}
