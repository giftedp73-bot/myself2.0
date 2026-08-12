import { Link } from "@tanstack/react-router";
import { Brand } from "@/components/brand";
import { Calendar, Home, LogOut, MessageCircle, Settings, Sparkles } from "lucide-react";

const nav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/memory", label: "Memory", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Brand to="/home" />
          <nav className="flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:px-4"
                activeProps={{ className: "bg-warm text-warm-foreground" }}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            <Link
              to="/"
              aria-label="Sign out"
              className="ml-1 rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 md:py-14">{children}</main>
    </div>
  );
}
