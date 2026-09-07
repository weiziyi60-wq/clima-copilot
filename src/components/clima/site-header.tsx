import { Link } from "@tanstack/react-router";

type Props = {
  variant?: "landing" | "dashboard";
};

export function SiteHeader({ variant = "landing" }: Props) {
  return (
    <header className="sticky top-0 z-30">
      <div className="absolute inset-0 -z-10 border-b border-glass-border bg-background/80 backdrop-blur-md" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="brand-gradient grid size-8 place-items-center rounded-lg text-ink font-semibold transition-transform group-hover:scale-105">
            C
          </span>
          <span className="text-sm font-semibold tracking-[0.3em] text-foreground">
            CLIMA
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            Methodology
          </a>
          <a href="#dimensions" className="transition-colors hover:text-foreground">
            Dimensions
          </a>
        </nav>

        {variant === "landing" ? (
          <Link
            to="/dashboard"
            className="brand-gradient rounded-lg px-4 py-2 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            to="/"
            className="glass rounded-lg px-4 py-2 text-sm text-foreground transition-colors hover:text-brand"
          >
            ← Home
          </Link>
        )}
      </div>
    </header>
  );
}
