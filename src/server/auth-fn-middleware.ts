import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabase as browserSupabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-fn middleware that requires an authenticated Supabase user.
 * - On the client, attaches the current session's access token as a Bearer header.
 * - On the server, validates the token and exposes { userId, claims }.
 */
export const requireAuthFn = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    let token: string | undefined;
    try {
      const { data } = await browserSupabase.auth.getSession();
      token = data.session?.access_token;
    } catch {
      // ignore — server will reject
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  })
  .server(async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Response("Server auth not configured", { status: 500 });
    }

    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Response("Unauthorized", { status: 401 });
    }
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) throw new Response("Unauthorized", { status: 401 });

    const sb = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await sb.auth.getClaims(token);
    if (error || !data?.claims?.sub) {
      throw new Response("Unauthorized", { status: 401 });
    }

    return next({
      context: { userId: data.claims.sub as string },
    });
  });