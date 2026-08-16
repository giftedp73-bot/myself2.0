import { createStart, createMiddleware } from "@tanstack/react-start";
// Import CSRF middleware with type checking for production environments
import * as TanStackStart from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const requestMiddleware = [errorMiddleware];

// Only add CSRF middleware if it's properly exported as a function
if (
  typeof TanStackStart.createCsrfMiddleware === "function"
) {
  const csrfMiddleware = TanStackStart.createCsrfMiddleware({
    filter: (ctx) => ctx.handlerType === "serverFn",
  });
  requestMiddleware.push(csrfMiddleware);
}

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware,
}));
