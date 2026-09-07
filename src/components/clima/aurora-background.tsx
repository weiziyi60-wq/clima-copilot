export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* paper base */}
      <div className="absolute inset-0 bg-background" />
      {/* drafting grid */}
      <div className="absolute inset-0 grid-ticks opacity-60" />
      {/* soft green washes */}
      <div
        className="animate-aurora-float absolute -left-40 -top-52 size-[620px] rounded-full opacity-30 blur-[110px]"
        style={{
          background: "radial-gradient(circle, oklch(0.82 0.06 155), transparent 70%)",
        }}
      />
      <div
        className="animate-aurora-float-slow absolute -right-32 top-40 size-[560px] rounded-full opacity-25 blur-[120px]"
        style={{
          background: "radial-gradient(circle, oklch(0.86 0.045 130), transparent 70%)",
        }}
      />
      {/* thin technical rules */}
      <div className="absolute inset-y-0 left-[12%] w-px bg-foreground/[0.05]" />
      <div className="absolute inset-y-0 right-[12%] w-px bg-foreground/[0.05]" />
      {/* bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-64"
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
      />
    </div>
  );
}
