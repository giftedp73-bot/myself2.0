import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getTodayCalendar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("timezone")
      .eq("id", context.userId)
      .maybeSingle();
    const { fetchTodayEvents } = await import("@/server/google.server");
    try {
      return await fetchTodayEvents(context.userId, profile?.timezone ?? "UTC");
    } catch (error) {
      console.error("Calendar fetch failed", error);
      return { connected: true, events: [], error: "Could not reach Google Calendar." };
    }
  });

export const getInboxSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { fetchInbox } = await import("@/server/google.server");
    try {
      return await fetchInbox(context.userId, 6);
    } catch (error) {
      console.error("Inbox fetch failed", error);
      return {
        connected: true,
        unreadTotal: 0,
        messages: [],
        error: "Could not reach Gmail.",
      };
    }
  });
