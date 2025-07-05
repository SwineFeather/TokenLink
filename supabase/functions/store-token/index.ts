import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

serve(async (req) => {
  try {
    const { player_uuid, player_name, token, expires_at } = await req.json();
    
    if (!player_uuid || !player_name || !token || !expires_at) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store the login token (this should work with your current schema)
    const { error: tokenError } = await supabase
      .from("login_tokens")
      .insert({ 
        player_uuid, 
        player_name, 
        token, 
        expires_at 
      });

    if (tokenError) {
      console.error("Token insert error:", tokenError);
      return new Response(JSON.stringify({ error: "Failed to store token: " + tokenError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Note: We're not creating profiles automatically since your schema requires auth.users
    // The profile creation should happen when the user actually logs in through the website
    console.log("Token stored successfully for player:", player_name);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Store token error:", e);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});