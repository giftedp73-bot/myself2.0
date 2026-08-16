import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { messages: ChatTurn[] }) => {
    if (!Array.isArray(input?.messages) || input.messages.length === 0) {
      throw new Error("No message to send.");
    }
    return {
      messages: input.messages
        .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
    };
  })
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("display_name, timezone")
      .eq("id", context.userId)
      .maybeSingle();
    const { generateChatReply } = await import("@/server/chat.server");
    const reply = await generateChatReply(
      context.userId,
      profile?.display_name ?? null,
      profile?.timezone ?? "UTC",
      data.messages,
    );
    return { reply };
  });
