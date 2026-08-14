import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(
        "id, display_name, phone, timezone, wake_time, briefing_enabled, briefing_delivery, telegram_chat_id, telegram_link_code",
      )
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

export const saveBriefingSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      display_name?: string;
      phone?: string;
      timezone?: string;
      wake_time?: string;
      briefing_enabled?: boolean;
      briefing_delivery?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const linkTelegram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("telegram_link_code")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!profile) throw new Error("Profile not found");

    const { findTelegramChatIdByCode } = await import("@/server/briefing.server");
    const chatId = await findTelegramChatIdByCode(profile.telegram_link_code);
    if (!chatId) {
      return {
        linked: false as const,
        message: `Send "${profile.telegram_link_code}" to the bot on Telegram, then tap Link again.`,
      };
    }
    const { error: updateError } = await context.supabase
      .from("profiles")
      .update({ telegram_chat_id: chatId })
      .eq("id", context.userId);
    if (updateError) throw updateError;
    return { linked: true as const, message: "Telegram linked." };
  });

export const sendBriefingNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("display_name, phone, timezone, briefing_delivery, telegram_chat_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!profile) throw new Error("Profile not found");

    const { buildBriefingText, placeBriefingCall, sendBriefingSms, sendTelegramMessage } =
      await import("@/server/briefing.server");

    const text = await buildBriefingText(context.userId, {
      display_name: profile.display_name,
      timezone: profile.timezone,
    });

    const delivery = profile.briefing_delivery;
    const sent: string[] = [];

    if (delivery === "telegram" || delivery === "both") {
      if (!profile.telegram_chat_id) throw new Error("Link Telegram first.");
      await sendTelegramMessage(profile.telegram_chat_id, text);
      sent.push("Telegram");
    }
    if (delivery === "call" || delivery === "both") {
      if (!profile.phone) throw new Error("Add your phone number first.");
      try {
        await placeBriefingCall(profile.phone, text);
        sent.push("phone call");
      } catch (callError) {
        console.error("Briefing call failed, falling back to SMS", callError);
        await sendBriefingSms(profile.phone, text);
        sent.push("SMS");
      }
    }

    return { ok: true, sent, text };
  });
