package com.tokenlink.login;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.IOException;
import java.time.Instant;

public class SupabaseClient {
    private final String supabaseUrl;
    private final String supabaseKey;
    private final OkHttpClient client;
    private final Gson gson;

    public SupabaseClient(String supabaseUrl, String supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.client = new OkHttpClient();
        this.gson = new Gson();
    }

    public boolean storeToken(String playerUuid, String playerName, String token) throws IOException {
        String url = supabaseUrl + "/functions/v1/store-token";
        
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("player_uuid", playerUuid);
        jsonObject.addProperty("player_name", playerName);
        jsonObject.addProperty("token", token);
        jsonObject.addProperty("expires_at", Instant.now().plusSeconds(300).getEpochSecond()); // 5 minutes
        
        String json = gson.toJson(jsonObject);

        RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));
        Request request = new Request.Builder()
            .url(url)
            .post(body)
            .addHeader("Authorization", "Bearer " + supabaseKey)
            .addHeader("Content-Type", "application/json")
            .build();

        try (Response response = client.newCall(request).execute()) {
            return response.isSuccessful();
        }
    }
}