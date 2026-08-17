import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Calendar, MessageCircle, Sparkles, Sun, Target } from "lucide-react";
import { MarketingLayout } from "@/components/marketing-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "me2.0 — Your autonomous personal AI assistant" },
      {
        name: "description",
        content:
          "me2.0 pulls your calendar, inbox, and goals into one calm daily briefing — for anyone who wants to spend their day on what actually matters.",
      },
      { property: "og:title", content: "me2.0 — Your autonomous personal AI assistant" },
      {
        property: "og:description",
        content: "One calm daily briefing from your calendar, inbox, and goals.",
      },
    ],
  }),
  component: Landing,
});

const goals = [
  { label: "Ship me2.0 v1", pct: 72 },
  { label: "Run 40km", pct: 45 },
];

const today = [
  { time: "09:30", label: "Standup" },
  { time: "13:00", label: "Design review" },
  { time: "17:00", label: "Gym" },
];

const pillars = [
  {
    icon: Sun,
    title: "A morning briefing that lands",
    body: "Every morning me2.0 reads your day back to you — priorities, schedule, inbox and goal momentum.",
  },
  {
    icon: Target,
    title: "Goals that don't quietly vanish",
    body: "Your goals stay in the loop, so nudges and briefings push what actually matters forward.",
  },
  {
    icon: MessageCircle,
    title: "Talk it through, by text or voice",
    body: "Ask me2.0 anything about your day. It already knows your calendar, inbox and context.",
  },
];

function Landing() {
  return (
    <MarketingLayout>
      <section className="mx-auto grid max-w-6xl items-center gap-14 pt-10 lg:grid-cols-2 lg:pt-16">
        <div>
          <p className="eyebrow">Personal coach · Executive assistant</p>
          <h1 className="mt-6 text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
            Your autonomous personal AI assistant.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            me2.0 pulls your calendar, inbox, and goals into one calm daily briefing — for anyone
            who wants to spend their day on what actually matters.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="text-foreground underline-offset-4 hover:underline">
                Sign in
              </Link>
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_20px_60px_-40px_rgba(80,50,30,0.4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-serif text-primary-foreground">
                m
              </span>
              <span className="font-serif font-semibold">me2.0</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-warm text-warm-foreground">
                <Sun className="h-3.5 w-3.5" />
              </span>
              <MessageCircle className="h-4 w-4" />
              <Calendar className="h-4 w-4" />
              <Target className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-warm p-5">
            <p className="eyebrow !text-warm-foreground">Today's briefing</p>
            <p className="mt-2 font-serif text-lg leading-snug">
              Good morning, Alex. Two meetings, one deep-work block, and your fitness goal is 3 days
              from done.
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border p-4">
              <p className="eyebrow !text-muted-foreground">Goals</p>
              <div className="mt-3 space-y-3">
                {goals.map((g) => (
                  <div key={g.label}>
                    <div className="flex justify-between text-sm">
                      <span>{g.label}</span>
                      <span className="text-muted-foreground">{g.pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${g.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="eyebrow !text-muted-foreground">Today</p>
              <ul className="mt-3 space-y-2 text-sm">
                {today.map((t) => (
                  <li key={t.time} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t.time} {t.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-6xl">
        <h2 className="max-w-2xl text-3xl md:text-4xl">
          Not another place to store tasks. An assistant that already knows.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.title} className="rounded-3xl border border-border bg-card p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warm text-warm-foreground">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl rounded-3xl bg-warm px-8 py-14 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-warm-foreground" />
        <h2 className="mx-auto mt-5 max-w-2xl text-3xl md:text-4xl">
          Wake up tomorrow already knowing what matters.
        </h2>
        <Link
          to="/auth"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </MarketingLayout>
  );
}
