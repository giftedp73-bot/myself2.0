import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/_authenticated/memory")({
  head: () => ({
    meta: [
      { title: "Memory — me2.0" },
      {
        name: "description",
        content:
          "Everything me2.0 remembers about you: priorities, goals, daily rhythm, and notes by category.",
      },
      { property: "og:title", content: "Memory — me2.0" },
      {
        property: "og:description",
        content: "Priorities, goals, daily rhythm and notes me2.0 keeps in mind.",
      },
    ],
  }),
  component: Memory,
});

const rhythm = [
  { label: "Wake up", value: "07:00" },
  { label: "Deep-focus start", value: "09:30" },
  { label: "Wind-down", value: "21:00" },
  { label: "Sleep", value: "23:00" },
];

function Memory() {
  const [priorities, setPriorities] = useState(["Business", "Health", "Family"]);
  const [newPriority, setNewPriority] = useState("");
  const [goals, setGoals] = useState([
    { title: "Submit YC Application", pct: 100 },
    { title: "Make me2.0 look profesh, finish voice calls, email drafting", pct: 66 },
  ]);
  const [newGoal, setNewGoal] = useState("");
  const [categories, setCategories] = useState<{ name: string; note: string }[]>([
    { name: "Business", note: "" },
  ]);
  const [newCategory, setNewCategory] = useState("");

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="eyebrow">Memory</p>
          <h1 className="mt-5 text-5xl">What me2.0 knows</h1>
          <p className="mt-4 text-muted-foreground">
            The context behind every briefing. Update it any time.
          </p>
        </div>

        <section className="rounded-3xl border border-border bg-card p-7">
          <h2 className="text-2xl">Top priorities</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            In order. me2.0 protects the top of this list.
          </p>
          <ul className="mt-5 space-y-3">
            {priorities.map((p, i) => (
              <li
                key={p}
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-warm font-serif text-sm text-warm-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm">{p}</span>
                <button
                  aria-label={`Remove ${p}`}
                  onClick={() => setPriorities(priorities.filter((x) => x !== p))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPriority.trim()) return;
              setPriorities([...priorities, newPriority.trim()]);
              setNewPriority("");
            }}
          >
            <input
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              placeholder="Add a priority"
              className="flex-1 rounded-full border border-border bg-background px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card p-7">
          <h2 className="text-2xl">Your goals</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Progress me2.0 nudges you on each morning.
          </p>
          <div className="mt-5 space-y-4">
            {goals.map((g) => (
              <div key={g.title} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 shrink-0 text-primary" /> {g.title}
                  </p>
                  <span className="text-sm text-muted-foreground">{g.pct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={g.pct}
                  onChange={(e) =>
                    setGoals(
                      goals.map((x) =>
                        x.title === g.title ? { ...x, pct: Number(e.target.value) } : x,
                      ),
                    )
                  }
                  className="mt-3 w-full accent-[var(--color-primary)]"
                />
              </div>
            ))}
          </div>
          <form
            className="mt-4 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newGoal.trim()) return;
              setGoals([...goals, { title: newGoal.trim(), pct: 0 }]);
              setNewGoal("");
              toast.success("Goal added.");
            }}
          >
            <input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a goal"
              className="flex-1 rounded-full border border-border bg-background px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              <Plus className="h-4 w-4" /> Add goal
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card p-7">
          <h2 className="text-2xl">Daily rhythm</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rough times me2.0 uses to shape nudges and briefings.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {rhythm.map((r) => (
              <label key={r.label} className="block">
                <span className="text-sm">{r.label}</span>
                <input
                  type="time"
                  defaultValue={r.value}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-7">
          <h2 className="text-2xl">Notes by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Specifics me2.0 should remember — names, dates, context.
          </p>
          <div className="mt-5 space-y-5">
            {categories.map((c) => (
              <label key={c.name} className="block">
                <span className="text-sm">{c.name}</span>
                <textarea
                  rows={3}
                  value={c.note}
                  onChange={(e) =>
                    setCategories(
                      categories.map((x) =>
                        x.name === c.name ? { ...x, note: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Anything me2.0 should keep in mind..."
                  className="mt-2 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            ))}
          </div>
          <form
            className="mt-4 flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCategory.trim()) return;
              setCategories([...categories, { name: newCategory.trim(), note: "" }]);
              setNewCategory("");
            }}
          >
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add a category"
              className="flex-1 rounded-full border border-border bg-background px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary">
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
