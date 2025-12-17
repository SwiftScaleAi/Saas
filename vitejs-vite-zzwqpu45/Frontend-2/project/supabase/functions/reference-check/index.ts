// supabase/functions/reference-check/index.ts

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Parse request body
    const { candidateId } = await req.json();

    // Initialize Supabase client with secrets
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Example: update candidate status in your table
    const { error } = await supabase
      .from("candidates")
      .update({ status: "reference-check" })
      .eq("id", candidateId);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ status: "success", candidateId }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "reference-check failed",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
});
