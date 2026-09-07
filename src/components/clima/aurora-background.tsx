export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* ink base */}
      <div className="absolute inset-0 bg-background" />
      {/* drafting grid */}
      <div className="absolute inset-0 grid-ticks opacity-70" />
      {/* aurora blooms */}
      <div
        className="animate-aurora-float absolute -left-24 -top-40 size-[520px] rounded-full opacity-45 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.84 0.16 168), transparent 70%)",
        }}
      />
      <div
        className="animate-aurora-float-slow absolute right-0 top-24 size-[560px] rounded-full opacity-40 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.16 250), transparent 70%)",
        }}
      />
      <div
        className="animate-pulse-soft absolute bottom-0 left-1/3 size-[480px] rounded-full opacity-35 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.70 0.18 305), transparent 70%)",
        }}
      />
      {/* bottom vignette to anchor content */}
      <div
        className="absolute inset-x-0 bottom-0 h-64"
        style={{
          background:
            "linear-gradient(to top, var(--background), transparent)",
        }}
      />
    </div>
  );
}
