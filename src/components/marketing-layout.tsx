import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/brand";

const links = [
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Brand />
          <nav className="flex items-center gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/auth"
              className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="px-6 pb-24 md:px-12">{children}</main>
      <footer className="border-t border-border px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>me2.0 — your autonomous personal AI assistant.</span>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground">
              About
            </Link>
            <Link to="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
