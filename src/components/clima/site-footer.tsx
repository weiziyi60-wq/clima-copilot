export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-glass-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-xs text-muted-foreground sm:flex-row lg:px-10">
        <div className="flex items-center gap-2.5">
          <span className="brand-gradient grid size-6 place-items-center rounded-md text-[11px] font-extrabold text-ink">
            C
          </span>
          <span>© 2025 CLIMA — early-stage prototype</span>
        </div>
        <span className="tracking-[0.2em] uppercase">ClimateTech · PropTech</span>
      </div>
    </footer>
  );
}
