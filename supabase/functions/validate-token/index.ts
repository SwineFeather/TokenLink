import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(JSON.stringify({ error: "No token provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("login_tokens")
      .select("player_uuid, player_name, expires_at, used")
      .eq("token", token)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = Math.floor(Date.now() / 1000);
    if (data.used || data.expires_at < now) {
      return new Response(JSON.stringify({ error: "Token expired or used" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Mark token as used
    await supabase
      .from("login_tokens")
      .update({ used: true })
      .eq("token", token);

    // Get or create profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("player_uuid", data.player_uuid)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error fetching profile:", profileError);
    }

    // Update last login
    await supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("player_uuid", data.player_uuid);

    return new Response(JSON.stringify({ 
      player_uuid: data.player_uuid, 
      player_name: data.player_name,
      profile: profile,
      valid: true 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Validate token error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});