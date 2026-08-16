export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function buildContext(userId: string, timezone: string) {
  const { fetchTodayEvents, fetchInbox } = await import("./google.server");
  const [calendar, inbox] = await Promise.all([
    fetchTodayEvents(userId, timezone).catch(() => ({ connected: false, events: [] })),
    fetchInbox(userId, 6).catch(() => ({ connected: false, unreadTotal: 0, messages: [] })),
  ]);

  const lines: string[] = [];
  lines.push(`Current time: ${new Date().toISOString()} (user timezone: ${timezone})`);

  if (!calendar.connected) {
    lines.push("Google Calendar: not connected.");
  } else if (calendar.events.length === 0) {
    lines.push("Calendar today: nothing scheduled.");
  } else {
    lines.push("Calendar today:");
    for (const event of calendar.events.slice(0, 10)) {
      lines.push(`- ${event.allDay ? "All day" : (event.start ?? "")} ${event.title}`);
    }
  }

  if (!inbox.connected) {
    lines.push("Gmail: not connected.");
  } else {
    lines.push(`Inbox: ${inbox.unreadTotal} unread.`);
    for (const message of inbox.messages.slice(0, 6)) {
      lines.push(`- ${message.from}: ${message.subject}`);
    }
  }

  return lines.join("\n");
}

export async function generateChatReply(
  userId: string,
  displayName: string | null,
  timezone: string,
  history: ChatMessage[],
): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const context = await buildContext(userId, timezone);

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: [
            `You are me2.0, ${displayName ?? "the user"}'s autonomous personal assistant.`,
            "Be warm, direct and brief — two or three short sentences unless asked for more.",
            "Use the live context below when relevant; never invent calendar events or emails.",
            "If something needed is not connected, say so plainly and suggest connecting it in Settings.",
            "",
            "LIVE CONTEXT:",
            context,
          ].join("\n"),
        },
        ...history.slice(-12).map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (res.status === 429) throw new Error("Rate limit reached — try again in a moment.");
  if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
  if (!res.ok) {
    const body = await res.text();
    console.error(`AI gateway failed [${res.status}]: ${body}`);
    throw new Error("me2.0 could not answer right now.");
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("me2.0 returned an empty reply.");
  return reply;
}
