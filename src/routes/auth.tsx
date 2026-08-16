import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/marketing-layout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/home" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void navigate({ to: "/home" });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/home" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) throw error;
        if (data.session) {
          await navigate({ to: "/home" });
        } else {
          toast.success("Check your email to confirm your account.");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
      });
      if (result.error) {
        toast.error("Could not sign in with Google.");
        return;
      }
      if (result.redirected) return;
      await navigate({ to: "/home" });
    } catch {
      toast.error("Could not sign in with Google.");
    }
  }

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
          onSubmit={onSubmit}
        >
          {mode === "signup" && (
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={onGoogle}
            className="w-full rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Continue with Google
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
