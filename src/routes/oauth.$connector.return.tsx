import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/oauth/$connector/return")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Finishing connection — me2.0" },
      { name: "description", content: "Completing your account connection with me2.0." },
      { property: "og:title", content: "Finishing connection — me2.0" },
      { property: "og:description", content: "Completing your account connection." },
    ],
  }),
  component: OAuthReturn,
});

function OAuthReturn() {
  const { connector } = Route.useParams();
  const [message, setMessage] = useState("Finishing connection…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notify = (
      type: "appUserConnectorOAuthComplete" | "appUserConnectorOAuthFailed",
      code?: string | null,
    ) => {
      window.opener?.postMessage(
        { type, connectorId: connector, code: code ?? null },
        window.location.origin,
      );
      window.close();
    };

    if (params.get("success") !== "true") {
      setMessage(params.get("error") ?? "The connection was not completed.");
      notify("appUserConnectorOAuthFailed");
      return;
    }
    const code = params.get("code");
    if (!code) {
      if (params.get("offline_access_allowed") === "false") {
        notify("appUserConnectorOAuthComplete");
        return;
      }
      setMessage("The connection finished without an exchange code.");
      notify("appUserConnectorOAuthFailed");
      return;
    }
    notify("appUserConnectorOAuthComplete", code);
  }, [connector]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
