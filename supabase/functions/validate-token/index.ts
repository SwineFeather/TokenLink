import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Validate-token request received');
    
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    
    console.log('Token validation requested:', token ? 'token present' : 'no token');
    
    if (!token) {
      console.error('No token provided in request');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "No token provided" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Looking up token in database');
    
    const { data, error } = await supabase
      .from("login_tokens")
      .select("player_uuid, player_name, expires_at, used")
      .eq("token", token)
      .single();

    if (error || !data) {
      console.error('Token lookup failed:', error?.message || 'No data returned');
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid token" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Token found for player:', data.player_name);

    const now = Math.floor(Date.now() / 1000);
    if (data.used || data.expires_at < now) {
      console.error('Token is expired or already used:', {
        used: data.used,
        expired: data.expires_at < now,
        expires_at: data.expires_at,
        current_time: now
      });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Token expired or already used" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark token as used
    const { error: updateError } = await supabase
      .from("login_tokens")
      .update({ used: true })
      .eq("token", token);

    if (updateError) {
      console.error('Failed to mark token as used:', updateError);
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Failed to process token" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Token validation successful for:', data.player_name);
    
    return new Response(JSON.stringify({ 
      valid: true,
      player_uuid: data.player_uuid, 
      player_name: data.player_name
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Validate token error:", e);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: "Server error", 
      details: e.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
