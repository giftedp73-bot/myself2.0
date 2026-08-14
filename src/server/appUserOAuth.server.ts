import {
  authorizeAppUserOAuth,
  disconnectAppUser,
} from "@/integrations/lovable/appUserConnector";
import {
  deleteConnectionForUser,
  getConnectionKeyForUser,
} from "./appUserConnections.server";
import { CALENDAR_CONNECTOR, GATEWAY_BASE_URL, GMAIL_CONNECTOR } from "./google.server";

const BASE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const SCOPES: Record<string, string[]> = {
  [GMAIL_CONNECTOR]: [...BASE_SCOPES, "https://www.googleapis.com/auth/gmail.readonly"],
  [CALENDAR_CONNECTOR]: [...BASE_SCOPES, "https://www.googleapis.com/auth/calendar.readonly"],
};

const CLIENT_KEY_ENV: Record<string, string> = {
  [GMAIL_CONNECTOR]: "GOOGLE_MAIL_APP_USER_CONNECTOR_CLIENT_API_KEY",
  [CALENDAR_CONNECTOR]: "GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY",
};

export function assertSupportedConnector(connectorId: string) {
  if (!SCOPES[connectorId]) throw new Error(`Unsupported connector: ${connectorId}`);
}

export async function startConnectorOAuthFlow(
  userId: string,
  connectorId: string,
  requestUrl: string,
): Promise<string> {
  assertSupportedConnector(connectorId);
  const clientAPIKey = process.env[CLIENT_KEY_ENV[connectorId]!];
  if (!clientAPIKey) {
    throw new Error(`${CLIENT_KEY_ENV[connectorId]} is not set`);
  }
  const returnUrl = new URL(`/oauth/${connectorId}/return`, requestUrl).toString();
  const existing = await getConnectionKeyForUser(userId, connectorId);

  const { authorizationUrl } = await authorizeAppUserOAuth({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectorId,
    appUserId: userId,
    clientAPIKey,
    returnUrl,
    ...(existing ? { connectionAPIKey: existing } : {}),
    credentialsConfiguration: { scopes: SCOPES[connectorId] ?? BASE_SCOPES },
  });
  return authorizationUrl;
}

export async function disconnectConnectorForUser(userId: string, connectorId: string) {
  assertSupportedConnector(connectorId);
  const connectionAPIKey = await getConnectionKeyForUser(userId, connectorId);
  if (connectionAPIKey) {
    try {
      await disconnectAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId,
      });
    } catch (error) {
      console.error("Gateway disconnect failed", error);
    }
  }
  await deleteConnectionForUser(userId, connectorId);
}
