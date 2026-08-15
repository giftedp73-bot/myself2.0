import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Mail, Phone, PlayCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import {
  completeConnectorConnect,
  disconnectConnector,
  getConnectionStatus,
  startConnectorConnect,
} from "@/lib/connectors.functions";
import {
  getMyProfile,
  linkTelegram,
  saveBriefingSettings,
  sendBriefingNow,
} from "@/lib/briefing.functions";
import { waitForOAuthCompletion } from "@/lib/oauth-popup";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — me2.0" },
      {
        name: "description",
        content:
          "Connect Google Calendar, Gmail and Telegram, and set up your morning voice briefing in me2.0.",
      },
      { property: "og:title", content: "Settings — me2.0" },
      {
        property: "og:description",
        content: "Connect your world and tune your morning briefing.",
      },
    ],
  }),
  component: Settings,
});

const deliveryOptions = [
  {
    id: "telegram",
    title: "Telegram voice note",
    body: "A voice message you can replay anytime.",
  },
  { id: "call", title: "Phone call", body: "me2.0 rings you and reads the briefing." },
  { id: "both", title: "Both", body: "A call, plus a voice note to keep." },
] as const;

const connectors = [
  {
    key: "google_calendar" as const,
    icon: Calendar,
    name: "Google Calendar",
    body: "Bring your real schedule into the dashboard and chat.",
  },
  {
    key: "google_mail" as const,
    icon: Mail,
    name: "Gmail",
    body: "Let me2.0 surface the messages that matter each morning.",
  },
];

function Settings() {
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: ["connections"], queryFn: () => getConnectionStatus() });
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getMyProfile() });

  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.data) return;
    setPhone(profile.data.phone ?? "");
    setTimezone(profile.data.timezone ?? "UTC");
  }, [profile.data]);

  const save = useMutation({
    mutationFn: (data: Parameters<typeof saveBriefingSettings>[0]["data"]) =>
      saveBriefingSettings({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const telegram = useMutation({
    mutationFn: () => linkTelegram(),
    onSuccess: (result) => {
      if (result.linked) {
        toast.success(result.message);
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        toast.info(result.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sendNow = useMutation({
    mutationFn: () => sendBriefingNow(),
    onSuccess: (result) => toast.success(`Briefing sent via ${result.sent.join(" and ")}.`),
    onError: (error: Error) => toast.error(error.message),
  });

  async function connect(connectorId: string) {
    const popup = window.open("", "me2-oauth", "width=600,height=720");
    if (!popup) {
      toast.error("Allow popups to connect this account.");
      return;
    }
    setPending(connectorId);
    try {
      const { authorizationUrl } = await startConnectorConnect({ data: { connectorId } });
      const completion = waitForOAuthCompletion(popup, connectorId);
      popup.location.href = authorizationUrl;
      const code = await completion;
      if (code) await completeConnectorConnect({ data: { code } });
      await queryClient.invalidateQueries({ queryKey: ["connections"] });
      await queryClient.invalidateQueries({ queryKey: ["calendar"] });
      await queryClient.invalidateQueries({ queryKey: ["inbox"] });
      toast.success("Connected.");
    } catch (error) {
      popup.close();
      toast.error(error instanceof Error ? error.message : "Could not connect.");
    } finally {
      setPending(null);
    }
  }

  async function disconnect(connectorId: string) {
    setPending(connectorId);
    try {
      await disconnectConnector({ data: { connectorId } });
      await queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast.success("Disconnected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disconnect.");
    } finally {
      setPending(null);
    }
  }

  const briefingOn = profile.data?.briefing_enabled ?? false;
  const delivery = profile.data?.briefing_delivery ?? "telegram";
  const linkCode = profile.data?.telegram_link_code ?? "…";
  const telegramLinked = Boolean(profile.data?.telegram_chat_id);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Settings</p>
        <h1 className="mt-5 text-5xl">Connect your world</h1>
        <p className="mt-4 text-muted-foreground">
          The more me2.0 knows about your day, the more useful it becomes.
          <br />
          Connect the accounts you'd like it to draw on.
        </p>

        <div className="mt-10 space-y-4">
          {connectors.map((c) => {
            const connected = status.data?.[c.key] ?? false;
            return (
              <div
                key={c.key}
                className="flex flex-wrap items-center gap-5 rounded-3xl border border-border bg-card px-6 py-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm text-warm-foreground">
                  <c.icon className="h-5 w-5" />
                </span>
                <div className="min-w-[14rem] flex-1">
                  <p className="flex flex-wrap items-center gap-3">
                    <span className="font-serif text-lg font-semibold">{c.name}</span>
                    {connected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warm px-2.5 py-1 text-[0.65rem] font-medium tracking-[0.12em] text-warm-foreground uppercase">
                        <Check className="h-3 w-3" /> Connected
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                </div>
                <button
                  disabled={pending === c.key || status.isLoading}
                  onClick={() => (connected ? disconnect(c.key) : connect(c.key))}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
                >
                  {pending === c.key ? "Working…" : connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>

        <section className="mt-8 rounded-3xl border border-border bg-card p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl">Morning voice briefing</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Each morning at your wake time, me2.0 speaks your day to you — priorities, schedule,
                inbox and goal momentum.
              </p>
            </div>
            <button
              onClick={() => save.mutate({ briefing_enabled: !briefingOn })}
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {briefingOn ? "Turn off" : "Turn on"}
            </button>
          </div>

          <p className="eyebrow mt-7 !text-muted-foreground">Delivery</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {deliveryOptions.map((o) => {
              const active = delivery === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => save.mutate({ briefing_delivery: o.id })}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    active ? "border-primary bg-warm" : "border-border hover:bg-secondary"
                  }`}
                >
                  <p className="flex items-center gap-2 font-serif font-semibold">
                    {o.title}
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{o.body}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow !text-muted-foreground">Phone number</p>
              <div className="mt-2 flex gap-3">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+14155551234"
                  className="flex-1 rounded-full border border-border bg-background px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() =>
                    save.mutate({ phone }, { onSuccess: () => toast.success("Phone number saved.") })
                  }
                  className="rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:bg-secondary"
                >
                  Save
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                International format, used only for your briefing call.
              </p>
            </div>
            <div>
              <p className="eyebrow !text-muted-foreground">Timezone</p>
              <div className="mt-2 flex gap-3">
                <input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex-1 rounded-full border border-border bg-background px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() =>
                    save.mutate(
                      { timezone },
                      { onSuccess: () => toast.success("Timezone saved.") },
                    )
                  }
                  className="rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:bg-secondary"
                >
                  Save
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Wake time {profile.data?.wake_time ?? "07:00"} — set it on your Memory page.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4 rounded-2xl bg-warm px-5 py-4">
            <div className="min-w-[14rem] flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Send className="h-4 w-4 text-primary" /> Telegram
                {telegramLinked && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <Check className="h-3 w-3" /> linked
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Message {linkCode} to{" "}
                <a
                  href="https://t.me/me2point0_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  @me2point0_bot
                </a>
                , then link.
              </p>
            </div>
            <button
              disabled={telegram.isPending}
              onClick={() => telegram.mutate()}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {telegram.isPending ? "Checking…" : "Link Telegram"}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <button
              disabled={sendNow.isPending}
              onClick={() => sendNow.mutate()}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <PlayCircle className="h-4 w-4" />{" "}
              {sendNow.isPending ? "Sending…" : "Send me one now"}
            </button>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" /> Calls need a caller ID on the connected phone account.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
