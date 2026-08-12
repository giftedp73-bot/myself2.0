import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About me2.0 — Why we built a personal AI assistant" },
      {
        name: "description",
        content:
          "me2.0 exists for the gap between the tools you already have and the day you meant to have. Here's what we believe.",
      },
      { property: "og:title", content: "About me2.0 — Why we built it" },
      {
        property: "og:description",
        content: "An assistant that knows your goals, reads your schedule and inbox, and tells you what deserves your attention.",
      },
    ],
  }),
  component: About,
});

const beliefs = [
  {
    title: "Calm over cramming",
    body: "A good assistant removes decisions. me2.0 tells you the two or three things that matter, not everything that exists.",
  },
  {
    title: "Context beats features",
    body: "It reads your real calendar and inbox. Advice without context is just a nicer to-do list.",
  },
  {
    title: "Momentum is the metric",
    body: "Goals only count if they move. Every briefing points at the next honest step.",
  },
  {
    title: "You stay in charge",
    body: "Anything that sends, deletes, or books asks you first. Autonomy without surprises.",
  },
];

function About() {
  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl pt-10">
        <p className="eyebrow">About</p>
        <h1 className="mt-6 text-5xl md:text-6xl">Why me2.0 exists.</h1>
        <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Most people don't lack tools. They have a calendar, an inbox, a notes app, and a list of
            goals — all in different places, none of them talking to each other.
          </p>
          <p>
            The result is familiar: the important email gets buried, the calendar fills with things
            that don't move you forward, and by mid-morning the priorities you set have quietly
            disappeared.
          </p>
          <p>
            me2.0 was built for that gap. Not another place to store tasks, but an assistant that
            already knows your goals, reads your real schedule and inbox, and tells you what
            deserves your attention today.
          </p>
        </div>

        <hr className="my-14 border-border" />

        <h2 className="text-3xl">What we believe</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {beliefs.map((b) => (
            <div key={b.title} className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-lg">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </article>
    </MarketingLayout>
  );
}
