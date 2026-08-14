import { fetchInbox, fetchTodayEvents } from "./google.server";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function gatewayHeaders(connectionKeyEnv: string, contentType: string) {
  return {
    Authorization: `Bearer ${requireEnv("LOVABLE_API_KEY")}`,
    "X-Connection-Api-Key": requireEnv(connectionKeyEnv),
    "Content-Type": contentType,
  };
}

async function gatewayFetch(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) {
    console.error(`Gateway request failed [${res.status}] ${url}: ${text}`);
    throw new Error(`Request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function formatTime(iso: string | null, timezone: string) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export async function buildBriefingText(
  userId: string,
  profile: { display_name: string | null; timezone: string },
): Promise<string> {
  const timezone = profile.timezone || "UTC";
  const [calendar, inbox] = await Promise.all([
    fetchTodayEvents(userId, timezone).catch(() => ({ connected: false, events: [] as never[] })),
    fetchInbox(userId, 3).catch(() => ({
      connected: false,
      unreadTotal: 0,
      messages: [] as never[],
    })),
  ]);

  const name = profile.display_name?.split(" ")[0] ?? "there";
  const lines: string[] = [`Good morning, ${name}. Here's your day.`];

  if (!calendar.connected) {
    lines.push("Your calendar isn't connected yet.");
  } else if (calendar.events.length === 0) {
    lines.push("Nothing on your calendar — a clear day ahead.");
  } else {
    lines.push(`${calendar.events.length} thing${calendar.events.length === 1 ? "" : "s"} on your calendar:`);
    for (const event of calendar.events.slice(0, 5)) {
      const time = event.allDay ? "All day" : formatTime(event.start, timezone);
      lines.push(`${time ? `${time} — ` : ""}${event.title}`);
    }
  }

  if (!inbox.connected) {
    lines.push("Gmail isn't connected yet.");
  } else if (inbox.messages.length === 0) {
    lines.push("Your inbox is clear.");
  } else {
    lines.push(`${inbox.unreadTotal} unread. Worth a look:`);
    for (const message of inbox.messages) {
      lines.push(`${message.from}: ${message.subject}`);
    }
  }

  lines.push("Pick one thing that matters and start there.");
  return lines.join("\n");
}

export async function sendTelegramMessage(chatId: string, text: string) {
  return gatewayFetch(`${GATEWAY_BASE_URL}/telegram/sendMessage`, {
    method: "POST",
    headers: gatewayHeaders("TELEGRAM_API_KEY", "application/json"),
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function findTelegramChatIdByCode(code: string): Promise<string | null> {
  const data = (await gatewayFetch(`${GATEWAY_BASE_URL}/telegram/getUpdates?limit=100`, {
    method: "GET",
    headers: gatewayHeaders("TELEGRAM_API_KEY", "application/json"),
  })) as {
    result?: Array<{ message?: { text?: string; chat?: { id?: number } } }>;
  };

  const match = (data.result ?? [])
    .reverse()
    .find((update) => update.message?.text?.toLowerCase().includes(code.toLowerCase()));
  const chatId = match?.message?.chat?.id;
  return chatId ? String(chatId) : null;
}

async function twilioFrom(): Promise<string> {
  const data = (await gatewayFetch(
    `${GATEWAY_BASE_URL}/twilio/IncomingPhoneNumbers.json?PageSize=1`,
    {
      method: "GET",
      headers: gatewayHeaders("TWILIO_API_KEY", "application/x-www-form-urlencoded"),
    },
  )) as { incoming_phone_numbers?: Array<{ phone_number?: string }> };
  const number = data.incoming_phone_numbers?.[0]?.phone_number;
  if (!number) {
    throw new Error("No phone number is available on the connected Twilio account.");
  }
  return number;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c,
  );
}

export async function placeBriefingCall(to: string, text: string) {
  const from = await twilioFrom();
  const twiml = `<Response><Say voice="Polly.Joanna">${escapeXml(text)}</Say></Response>`;
  return gatewayFetch(`${GATEWAY_BASE_URL}/twilio/Calls.json`, {
    method: "POST",
    headers: gatewayHeaders("TWILIO_API_KEY", "application/x-www-form-urlencoded"),
    body: new URLSearchParams({ To: to, From: from, Twiml: twiml }).toString(),
  });
}

export async function sendBriefingSms(to: string, text: string) {
  const from = await twilioFrom();
  return gatewayFetch(`${GATEWAY_BASE_URL}/twilio/Messages.json`, {
    method: "POST",
    headers: gatewayHeaders("TWILIO_API_KEY", "application/x-www-form-urlencoded"),
    body: new URLSearchParams({ To: to, From: from, Body: text.slice(0, 1500) }).toString(),
  });
}
