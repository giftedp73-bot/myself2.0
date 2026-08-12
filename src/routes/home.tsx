import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CloudSun,
  Link2,
  Mail,
  MessageCircle,
  Plus,
  Quote,
  Sparkles,
  Star,
  Calendar as CalendarIcon,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — me2.0" },
      {
        name: "description",
        content:
          "Your me2.0 home: today's briefing, goal momentum, top priorities, calendar and inbox in one calm view.",
      },
      { property: "og:title", content: "Home — me2.0" },
      {
        property: "og:description",
        content: "Today's briefing, goals, calendar and inbox in one place.",
      },
    ],
  }),
  component: HomePage,
});

const quickActions = [
  { icon: MessageCircle, label: "Ask me2.0", to: "/chat" as const },
  { icon: Plus, label: "New goal", to: "/memory" as const },
  { icon: CalendarIcon, label: "See week", to: "/calendar" as const },
  { icon: Link2, label: "Connections", to: "/settings" as const },
];

const goals = [
  {
    pct: 100,
    tag: "Work",
    note: '"Submit YC Application" is almost done. Close it out.',
  },
  {
    pct: 66,
    tag: "Work",
    note: '"Make me2.0 look profesh, finish voice calls, email drafting" is behind. Block 30 minutes this week.',
  },
];

const priorities = ["Business", "Health", "Family"];

const inbox = [
  {
    from: "Jobgether via LinkedIn",
    subject: "Jobgether Newsletter : Senior Job Search Strategy: Fix the Sig…",
    preview: "Senior Job Search Strategy: Fix the Signal Problem",
  },
  {
    from: "Rue La La",
    subject: "Restocked Christian Louboutin with $599.99 Styles • Style by …",
    preview: "Up to 30% Off Pre-Loved Luxe • The Special-Size Shoe Shop • Bottoms…",
  },
  {
    from: "Google",
    subject: "Security alert for me2point00@gmail.com",
    preview: "A new sign-in on Chrome — review it if this wasn't you.",
  },
];

function Ring({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-secondary)" strokeWidth="5" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 fill-foreground text-[14px]"
        transform="rotate(90 32 32)"
      >
        {pct}%
      </text>
    </svg>
  );
}

function HomePage() {
  return (
    <AppLayout>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl">Good evening, gifted.</h1>
          <p className="mt-3 text-muted-foreground">Here's how your day is shaping up.</p>
        </div>
        <div className="flex items-center gap-5 rounded-3xl border border-border bg-card px-6 py-4">
          <CloudSun className="h-7 w-7 text-primary" />
          <div className="text-right">
            <p className="font-serif text-2xl leading-none">18°</p>
            <p className="text-xs text-muted-foreground">Partly cloudy</p>
          </div>
          <span className="h-10 w-px bg-border" />
          <div className="text-right">
            <p className="font-serif text-2xl leading-none">18:49</p>
            <p className="text-xs text-muted-foreground">Lisbon</p>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-3xl bg-warm p-7">
        <div className="flex gap-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow !text-warm-foreground">me2.0 · Today's briefing</p>
            <p className="mt-3 font-serif text-xl leading-snug md:text-2xl">
              Priorities on the table, gifted: Business. Let's cut noise and move one of them
              forward today.
            </p>
            <Link
              to="/chat"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              Talk it through <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm transition-colors hover:bg-secondary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warm text-warm-foreground">
              <a.icon className="h-4 w-4" />
            </span>
            {a.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-border bg-card p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">What matters most</p>
              <h2 className="mt-2 text-2xl">Your goals</h2>
            </div>
            <Link
              to="/memory"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Add goal
            </Link>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            {goals.map((g) => (
              <div key={g.note} className="flex gap-4">
                <Ring pct={g.pct} />
                <div>
                  <p className="eyebrow !text-muted-foreground">{g.tag}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-7">
            <p className="eyebrow flex items-center gap-2">
              <Star className="h-3.5 w-3.5" /> Top priorities
            </p>
            <ol className="mt-4 space-y-3">
              {priorities.map((p, i) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warm font-serif text-sm text-warm-foreground">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-card p-7">
            <p className="eyebrow flex items-center gap-2">
              <Quote className="h-3.5 w-3.5" /> A thought for today
            </p>
            <blockquote className="mt-4 font-serif text-xl leading-snug">
              “The point isn't to become someone else. It's to become more of who you already are —
              deliberately.”
            </blockquote>
          </section>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Today's calendar</h2>
            <span className="text-sm text-muted-foreground">0 events</span>
          </div>
          <p className="mt-16 mb-16 text-center text-sm text-muted-foreground">
            Nothing on your calendar — a clear day ahead.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-7">
          <h2 className="text-xl">Inbox</h2>
          <p className="mt-1 text-sm text-muted-foreground">201 unread · 6 worth your attention</p>
          <ul className="mt-5 space-y-5">
            {inbox.map((m) => (
              <li key={m.subject} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm text-warm-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.from}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
