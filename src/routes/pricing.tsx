import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/marketing-layout";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — me2.0 personal AI assistant" },
      {
        name: "description",
        content:
          "Starter at $15/mo, Pro at $29/mo with voice and autonomy, and the Exclusive concierge tier at $99/mo — join the waitlist.",
      },
      { property: "og:title", content: "Pricing — me2.0 personal AI assistant" },
      {
        property: "og:description",
        content: "Three plans: Starter, Pro, and the Exclusive real-world concierge tier.",
      },
    ],
  }),
  component: Pricing,
});

const starter = [
  "Gmail + Calendar connected",
  "Morning briefings",
  "Bill payment reminders",
  "Email reply drafts (for your review before sending)",
  "Calendar updates",
  "Goal tracking",
  "Event reminders",
  "Text chat",
  "Fair-use monthly limits apply",
];

const pro = [
  "Voice mode — speak and listen, not just type",
  "Send emails directly — with confirmation before anything sends",
  "Delete/clean up emails — with confirmation before anything deletes",
  "Proactive nudges beyond the morning briefing (pre-meeting prep, end-of-day wind-down)",
  "Voice calling to your contacts — me2.0 can call people in your phone book on your behalf for arrangements (booking, confirming plans, rescheduling) or a quick check-in call",
  "Higher usage limits than Starter",
  "Multi-device sync",
];

const exclusive = [
  "Hotel, restaurant, and reservation bookings",
  "Flight and event bookings",
  "Ride-hailing (Uber, taxis) on your behalf",
  "Grocery shopping",
  "Bill payments",
  "Personalized lifestyle suggestions",
];

function Pricing() {
  const [email, setEmail] = useState("");

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl pt-10 text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="mt-6 text-5xl md:text-6xl">Pick how much me2.0 does for you.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Start with daily clarity. Move up when you want me2.0 acting on your behalf.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-0 overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-3">
        <section className="p-8">
          <h2 className="text-2xl">Starter</h2>
          <p className="mt-2 text-sm text-muted-foreground">Everything you need, day to day.</p>
          <p className="mt-6 font-serif text-5xl">
            $15<span className="text-base text-muted-foreground">/mo</span>
          </p>
          <ul className="mt-7 space-y-3 text-sm">
            {starter.map((f) => (
              <li key={f} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/auth"
            className="mt-8 flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="border-border p-8 lg:border-x">
          <h2 className="text-2xl">Pro</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything in Starter, with more autonomy.
          </p>
          <p className="mt-6 font-serif text-5xl">
            $29<span className="text-base text-muted-foreground">/mo</span>
          </p>
          <p className="mt-7 text-sm font-medium">Everything in Starter, plus:</p>
          <ul className="mt-4 space-y-3 text-sm">
            {pro.map((f) => (
              <li key={f} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/auth"
            className="mt-8 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-warm px-3 py-1 text-[0.7rem] font-medium tracking-[0.14em] text-warm-foreground uppercase">
            <Clock className="h-3 w-3" /> Waitlist · coming soon
          </span>
          <h2 className="mt-4 text-2xl">Exclusive</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A real-world concierge — coming soon.
          </p>
          <p className="mt-6 font-serif text-5xl">
            $99<span className="text-base text-muted-foreground">/mo</span>
          </p>
          <p className="mt-7 text-sm font-medium">Rolling out to Exclusive members</p>
          <p className="mt-1 text-sm text-muted-foreground">Everything in Pro, plus:</p>
          <ul className="mt-4 space-y-3 text-sm">
            {exclusive.map((f) => (
              <li key={f} className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Available as each capability ships — join now to lock in early access and this price.
          </p>
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              toast.success("You're on the Exclusive waitlist.");
              setEmail("");
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="w-full rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Join the waitlist
            </button>
          </form>
        </section>
      </div>
    </MarketingLayout>
  );
}
