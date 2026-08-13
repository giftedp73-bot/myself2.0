import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/calendar")({
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


function CalendarPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Calendar</p>
        <h1 className="mt-5 text-5xl">Today, at a glance</h1>
        <p className="mt-4 text-muted-foreground">
          A calmer view of your day, drawn from your Google Calendar.
        </p>

        <section className="mt-10 rounded-3xl border border-border bg-card p-8">
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nothing on your calendar — a clear day ahead.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
