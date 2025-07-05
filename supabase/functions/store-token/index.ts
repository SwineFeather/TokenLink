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

    // First, check if profile exists, if not create it
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("player_uuid", player_uuid)
      .single();

    if (!existingProfile) {
      // Create new profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ 
          player_uuid, 
          player_name,
          last_login: new Date().toISOString()
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        return new Response(JSON.stringify({ error: "Failed to create profile" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      // Update last login for existing profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          last_login: new Date().toISOString(),
          player_name: player_name // Update name in case it changed
        })
        .eq("player_uuid", player_uuid);

      if (updateError) {
        console.error("Error updating profile:", updateError);
      }
    }

    // Store the login token
    const { error: tokenError } = await supabase
      .from("login_tokens")
      .insert({ player_uuid, player_name, token, expires_at });

    if (tokenError) {
      return new Response(JSON.stringify({ error: tokenError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

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