import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mic, Plus, Send, Sparkles, Type } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { sendChatMessage } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "Chat — me2.0" },
      {
        name: "description",
        content:
          "Talk to your me2.0 by text or voice. It already knows your calendar, inbox, goals and context.",
      },
      { property: "og:title", content: "Chat — me2.0" },
      {
        property: "og:description",
        content: "Type or speak to your me2.0 about your day.",
      },
    ],
  }),
  component: Chat,
});

type Message = { id: number; role: "user" | "assistant"; text: string; time: string };

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    const history = [...messages, { id: Date.now(), role: "user" as const, text, time: now() }];
    setMessages(history);
    setDraft("");
    setSending(true);
    try {
      const { reply } = await sendChatMessage({
        data: { messages: history.map((m) => ({ role: m.role, content: m.text })) },
      });
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "assistant", text: reply, time: now() },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "me2.0 could not answer right now.");
    } finally {
      setSending(false);
    }
  }


  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl">Chat</h1>
            <p className="mt-2 text-muted-foreground">Type a message to your me2.0.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMessages([])}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              <Plus className="h-4 w-4" /> New chat
            </button>
            <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
              <button
                onClick={() => setMode("text")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ${
                  mode === "text" ? "bg-warm text-warm-foreground" : "text-muted-foreground"
                }`}
              >
                <Type className="h-4 w-4" /> Text
              </button>
              <button
                onClick={() => setMode("voice")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm ${
                  mode === "voice" ? "bg-warm text-warm-foreground" : "text-muted-foreground"
                }`}
              >
                <Mic className="h-4 w-4" /> Voice
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 min-h-[22rem] space-y-6 rounded-3xl border border-border bg-card p-6">
          {messages.length === 0 && (
            <p className="py-20 text-center text-sm text-muted-foreground">
              A fresh thread. Say anything.
            </p>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[75%] rounded-3xl bg-primary px-5 py-3 text-primary-foreground">
                  <p className="whitespace-pre-line">{m.text}</p>
                  <p className="mt-1 text-xs opacity-70">{m.time}</p>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex items-end gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="max-w-[80%] rounded-3xl bg-secondary px-5 py-4">
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{m.time}</p>
                </div>
              </div>
            ),
          )}
        </div>

        {mode === "text" ? (
          <form
            onSubmit={send}
            className="mt-5 flex items-center gap-3 rounded-full border border-border bg-card pr-2 pl-6"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent py-4 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={sending}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-warm text-warm-foreground disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-9">
            <button
              aria-label="Hold to talk"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Mic className="h-6 w-6" />
            </button>
            <p className="text-sm text-muted-foreground">Tap to speak — me2.0 answers out loud.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
