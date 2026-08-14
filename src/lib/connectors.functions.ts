import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listConnectedConnectors } = await import("@/server/appUserConnections.server");
    const connected = await listConnectedConnectors(context.userId);
    return {
      google_mail: connected.includes("google_mail"),
      google_calendar: connected.includes("google_calendar"),
    };
  });

export const startConnectorConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { connectorId: string }) => input)
  .handler(async ({ data, context }) => {
    const request = getRequest();
    if (!request) throw new Error("OAuth must start from an app request.");
    const { startConnectorOAuthFlow } = await import("@/server/appUserOAuth.server");
    const authorizationUrl = await startConnectorOAuthFlow(
      context.userId,
      data.connectorId,
      request.url,
    );
    return { authorizationUrl };
  });

export const completeConnectorConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data, context }) => {
    const { exchangeAppUserOAuthCode } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const { saveConnectionKeyForUser } = await import("@/server/appUserConnections.server");
    const { assertSupportedConnector } = await import("@/server/appUserOAuth.server");
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      "https://connector-gateway.lovable.dev",
      data.code,
    );
    assertSupportedConnector(connectorId);
    await saveConnectionKeyForUser(context.userId, connectorId, connectionAPIKey);
    return { ok: true, connectorId };
  });

export const disconnectConnector = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { connectorId: string }) => input)
  .handler(async ({ data, context }) => {
    const { disconnectConnectorForUser } = await import("@/server/appUserOAuth.server");
    await disconnectConnectorForUser(context.userId, data.connectorId);
    return { ok: true };
  });
