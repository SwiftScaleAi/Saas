// Supabase Edge Function: inbound-application
// Path: supabase/functions/inbound-application/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processInboundApplication } from "../../../src/engine/inbound/fullInboundApplicationService.ts";

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405 }
      );
    }

    const body = await req.json();

    if (!body || !body.rawText) {
      return new Response(
        JSON.stringify({ error: "Missing required field: rawText" }),
        { status: 400 }
      );
    }

    const result = await processInboundApplication({
      rawText: body.rawText,
      source: body.source ?? "inbound",
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("Inbound application error:", err);

    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500 }
    );
  }
});
