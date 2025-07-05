package com.tokenlink.login;

import org.bukkit.plugin.java.JavaPlugin;

public class TokenLinkPlugin extends JavaPlugin {
    private SupabaseClient supabaseClient;
    private CooldownManager cooldownManager;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        String supabaseUrl = getConfig().getString("supabase.url");
        String supabaseKey = getConfig().getString("supabase.api-key");
        supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
        cooldownManager = new CooldownManager(getConfig().getInt("cooldown.seconds"));
        getCommand("login").setExecutor(new LoginCommand(this));
        getLogger().info("TokenLink enabled!");
    }

    public SupabaseClient getSupabaseClient() {
        return supabaseClient;
    }

    public CooldownManager getCooldownManager() {
        return cooldownManager;
    }

    public boolean isLoggingEnabled() {
        return getConfig().getBoolean("logging.enabled");
    }
} 