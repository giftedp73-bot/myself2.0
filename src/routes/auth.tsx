import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — me2.0" },
      {
        name: "description",
        content: "Sign in or create your me2.0 account and get your first morning briefing tomorrow.",
      },
      { property: "og:title", content: "Sign in — me2.0" },
      {
        property: "og:description",
        content: "Sign in to me2.0 and get your day back as one calm briefing.",
      },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-md pt-14">
        <p className="eyebrow">{mode === "signin" ? "Welcome back" : "Get started"}</p>
        <h1 className="mt-5 text-4xl md:text-5xl">
          {mode === "signin" ? "Sign in to me2.0." : "Create your me2.0."}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {mode === "signin"
            ? "Your briefing, goals and memory are waiting."
            : "Two minutes now, and tomorrow starts with a briefing."}
        </p>

        <form
          className="mt-9 space-y-4 rounded-3xl border border-border bg-card p-7"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/home" });
          }}
        >
          {mode === "signup" && (
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input
                required
                placeholder="Alex"
                className="mt-2 w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="mt-2 w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="mt-2 w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? "No account yet? Create one"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </MarketingLayout>
  );
}
