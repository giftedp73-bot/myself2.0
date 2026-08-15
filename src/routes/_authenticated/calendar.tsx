import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { getTodayCalendar } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — me2.0" },
      {
        name: "description",
        content: "A calmer view of your day, drawn from your Google Calendar by me2.0.",
      },
      { property: "og:title", content: "Calendar — me2.0" },
      {
        property: "og:description",
        content: "Today at a glance, drawn from your connected calendar.",
      },
    ],
  }),
  component: CalendarPage,
});

function formatTime(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function CalendarPage() {
  const calendar = useQuery({ queryKey: ["calendar"], queryFn: () => getTodayCalendar() });
  const events = calendar.data?.events ?? [];

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Calendar</p>
        <h1 className="mt-5 text-5xl">Today, at a glance</h1>
        <p className="mt-4 text-muted-foreground">
          A calmer view of your day, drawn from your Google Calendar.
        </p>

        <section className="mt-10 rounded-3xl border border-border bg-card p-8">
          {calendar.isLoading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Loading your day…</p>
          ) : calendar.data && !calendar.data.connected ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Your calendar isn't connected yet.{" "}
              <Link to="/settings" className="text-primary underline underline-offset-4">
                Connect Google Calendar
              </Link>
              .
            </p>
          ) : events.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Nothing on your calendar — a clear day ahead.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {events.map((event) => (
                <li key={event.id} className="flex gap-6 py-5 first:pt-0 last:pb-0">
                  <span className="w-20 shrink-0 font-serif text-sm text-muted-foreground">
                    {event.allDay ? "All day" : formatTime(event.start)}
                  </span>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    {event.location && (
                      <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
