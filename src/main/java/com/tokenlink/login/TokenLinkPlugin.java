package com.tokenlink.login;

import org.bukkit.plugin.java.JavaPlugin;

public class TokenLinkPlugin extends JavaPlugin {
    private SupabaseClient supabaseClient;
    private CooldownManager cooldownManager;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        initializePlugin();
        getLogger().info("TokenLink enabled!");
    }

    private void initializePlugin() {
        // Initialize configuration
        String supabaseUrl = getConfig().getString("supabase.url");
        String supabaseKey = getConfig().getString("supabase.api-key");
        int cooldownSeconds = getConfig().getInt("cooldown.seconds");
        
        // Initialize components
        supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
        cooldownManager = new CooldownManager(cooldownSeconds);
        
        // Register commands
        getCommand("login").setExecutor(new LoginCommand(this));
        getCommand("tokenlink").setExecutor(new TokenLinkCommand(this));
        getCommand("tokenlink").setTabCompleter(new TokenLinkCommand(this));
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

    /**
     * Reinitialize the Supabase client with new configuration
     */
    public void reinitializeSupabaseClient(String supabaseUrl, String supabaseKey) {
        this.supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
    }

    /**
     * Reinitialize the cooldown manager with new configuration
     */
    public void reinitializeCooldownManager(int cooldownSeconds) {
        this.cooldownManager = new CooldownManager(cooldownSeconds);
    }
} 