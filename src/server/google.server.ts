import { callAsAppUser } from "@/integrations/lovable/appUserConnector";
import { getConnectionKeyForUser } from "./appUserConnections.server";

export const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";

export const GMAIL_CONNECTOR = "google_mail";
export const CALENDAR_CONNECTOR = "google_calendar";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  allDay: boolean;
  location: string | null;
}

export interface InboxMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  unread: boolean;
}

async function call(userId: string, connectorId: string, path: string) {
  const connectionAPIKey = await getConnectionKeyForUser(userId, connectorId);
  if (!connectionAPIKey) return null;
  const res = await callAsAppUser({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectionAPIKey,
    connectorId,
    path,
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Gateway request failed [${res.status}] ${connectorId}${path}: ${body}`);
    throw new Error(`${connectorId} request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchTodayEvents(
  userId: string,
  timezone = "UTC",
): Promise<{ connected: boolean; events: CalendarEvent[] }> {
  const now = new Date();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "20",
    timeZone: timezone,
  });

  const data = (await call(
    userId,
    CALENDAR_CONNECTOR,
    `/calendar/v3/calendars/primary/events?${params.toString()}`,
  )) as {
    items?: Array<{
      id: string;
      summary?: string;
      location?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }>;
  } | null;

  if (!data) return { connected: false, events: [] };

  return {
    connected: true,
    events: (data.items ?? []).map((item) => ({
      id: item.id,
      title: item.summary ?? "(no title)",
      start: item.start?.dateTime ?? item.start?.date ?? null,
      end: item.end?.dateTime ?? item.end?.date ?? null,
      allDay: !item.start?.dateTime,
      location: item.location ?? null,
    })),
  };
}

function header(
  headers: Array<{ name?: string; value?: string }> | undefined,
  name: string,
): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function fetchInbox(
  userId: string,
  limit = 6,
): Promise<{ connected: boolean; unreadTotal: number; messages: InboxMessage[] }> {
  const list = (await call(
    userId,
    GMAIL_CONNECTOR,
    `/gmail/v1/users/me/messages?maxResults=${limit}&q=is:unread+in:inbox`,
  )) as { messages?: Array<{ id: string }>; resultSizeEstimate?: number } | null;

  if (!list) return { connected: false, unreadTotal: 0, messages: [] };

  const labels = (await call(userId, GMAIL_CONNECTOR, "/gmail/v1/users/me/labels/UNREAD")) as {
    messagesUnread?: number;
  } | null;

  const messages = await Promise.all(
    (list.messages ?? []).map(async (m) => {
      const detail = (await call(
        userId,
        GMAIL_CONNECTOR,
        `/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
      )) as {
        id: string;
        snippet?: string;
        labelIds?: string[];
        payload?: { headers?: Array<{ name?: string; value?: string }> };
      } | null;
      if (!detail) return null;
      return {
        id: detail.id,
        from: header(detail.payload?.headers, "From").replace(/<[^>]*>/g, "").trim() || "Unknown",
        subject: header(detail.payload?.headers, "Subject") || "(no subject)",
        preview: detail.snippet ?? "",
        unread: detail.labelIds?.includes("UNREAD") ?? true,
      } satisfies InboxMessage;
    }),
  );

  return {
    connected: true,
    unreadTotal: labels?.messagesUnread ?? list.resultSizeEstimate ?? 0,
    messages: messages.filter((m): m is InboxMessage => m !== null),
  };
}
