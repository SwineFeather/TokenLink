package com.tokenlink.login;

import okhttp3.*;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.IOException;

public class NetworkTest {
    
    public static void testConnectivity(JavaPlugin plugin) {
        OkHttpClient client = new OkHttpClient();
        
        // Test 1: Basic HTTPS connectivity
        try {
            Request testRequest = new Request.Builder()
                .url("https://httpbin.org/get")
                .build();
            
            try (Response response = client.newCall(testRequest).execute()) {
                plugin.getLogger().info("✓ Basic HTTPS connectivity: OK (Status: " + response.code() + ")");
            }
        } catch (Exception e) {
            plugin.getLogger().warning("✗ Basic HTTPS connectivity failed: " + e.getMessage());
        }
        
        // Test 2: Supabase domain resolution
        try {
            Request supabaseRequest = new Request.Builder()
                .url("https://erdconvorgeupvavlwv.supabase.co/rest/v1/")
                .build();
            
            try (Response response = client.newCall(supabaseRequest).execute()) {
                plugin.getLogger().info("✓ Supabase domain resolution: OK (Status: " + response.code() + ")");
            }
        } catch (Exception e) {
            plugin.getLogger().warning("✗ Supabase domain resolution failed: " + e.getMessage());
        }
        
        // Test 3: Supabase Edge Functions endpoint
        try {
            Request functionRequest = new Request.Builder()
                .url("https://erdconvorgeupvavlwv.supabase.co/functions/v1/")
                .build();
            
            try (Response response = client.newCall(functionRequest).execute()) {
                plugin.getLogger().info("✓ Supabase Edge Functions endpoint: OK (Status: " + response.code() + ")");
            }
        } catch (Exception e) {
            plugin.getLogger().warning("✗ Supabase Edge Functions endpoint failed: " + e.getMessage());
        }
        
        // Test 4: Try to resolve Supabase IP manually
        plugin.getLogger().info("Attempting to resolve Supabase IP...");
        try {
            java.net.InetAddress address = java.net.InetAddress.getByName("erdconvorgeupvavlwv.supabase.co");
            plugin.getLogger().info("✓ Supabase IP resolved: " + address.getHostAddress());
            
            // Test connection to IP directly
            Request ipRequest = new Request.Builder()
                .url("https://" + address.getHostAddress() + "/rest/v1/")
                .addHeader("Host", "erdconvorgeupvavlwv.supabase.co")
                .build();
            
            try (Response response = client.newCall(ipRequest).execute()) {
                plugin.getLogger().info("✓ Direct IP connection: OK (Status: " + response.code() + ")");
            }
        } catch (Exception e) {
            plugin.getLogger().warning("✗ IP resolution failed: " + e.getMessage());
        }
    }
} 