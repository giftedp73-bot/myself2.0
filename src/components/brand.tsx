import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-serif text-lg text-primary-foreground">
        m
      </span>
      <span className="font-serif text-xl font-semibold tracking-tight">me2.0</span>
    </Link>
  );
}
