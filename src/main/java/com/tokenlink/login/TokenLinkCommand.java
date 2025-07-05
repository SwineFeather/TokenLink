package com.tokenlink.login;

import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TokenLinkCommand implements CommandExecutor, TabCompleter {
    private final TokenLinkPlugin plugin;

    public TokenLinkCommand(TokenLinkPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!sender.hasPermission("tokenlink.admin")) {
            sender.sendMessage(ChatColor.RED + "You don't have permission to use this command!");
            return true;
        }

        if (args.length == 0) {
            sender.sendMessage(ChatColor.YELLOW + "TokenLink Plugin Commands:");
            sender.sendMessage(ChatColor.GRAY + "/tokenlink reload " + ChatColor.WHITE + "- Reload the plugin configuration");
            sender.sendMessage(ChatColor.GRAY + "/tokenlink status " + ChatColor.WHITE + "- Show plugin status");
            sender.sendMessage(ChatColor.GRAY + "/tokenlink test " + ChatColor.WHITE + "- Test network connectivity");
            sender.sendMessage(ChatColor.GRAY + "/tokenlink dns " + ChatColor.WHITE + "- Test DNS resolution");
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "reload":
                return handleReload(sender);
            case "status":
                return handleStatus(sender);
            case "test":
                return handleTest(sender);
            case "dns":
                return handleDns(sender);
            default:
                sender.sendMessage(ChatColor.RED + "Unknown subcommand. Use /tokenlink for help.");
                return true;
        }
    }

    private boolean handleReload(CommandSender sender) {
        try {
            // Reload the configuration
            plugin.reloadConfig();
            
            // Reinitialize the Supabase client with new config
            String supabaseUrl = plugin.getConfig().getString("supabase.url");
            String supabaseKey = plugin.getConfig().getString("supabase.api-key");
            plugin.reinitializeSupabaseClient(supabaseUrl, supabaseKey);
            
            // Reinitialize the cooldown manager with new config
            int cooldownSeconds = plugin.getConfig().getInt("cooldown.seconds");
            plugin.reinitializeCooldownManager(cooldownSeconds);
            
            sender.sendMessage(ChatColor.GREEN + "TokenLink configuration reloaded successfully!");
            plugin.getLogger().info("Configuration reloaded by " + sender.getName());
            
        } catch (Exception e) {
            sender.sendMessage(ChatColor.RED + "Failed to reload configuration: " + e.getMessage());
            plugin.getLogger().warning("Failed to reload configuration: " + e.getMessage());
        }
        
        return true;
    }

    private boolean handleStatus(CommandSender sender) {
        sender.sendMessage(ChatColor.YELLOW + "=== TokenLink Status ===");
        sender.sendMessage(ChatColor.GRAY + "Version: " + ChatColor.WHITE + plugin.getDescription().getVersion());
        sender.sendMessage(ChatColor.GRAY + "Supabase URL: " + ChatColor.WHITE + 
            (plugin.getConfig().getString("supabase.url") != null ? "Configured" : "Not configured"));
        sender.sendMessage(ChatColor.GRAY + "Supabase API Key: " + ChatColor.WHITE + 
            (plugin.getConfig().getString("supabase.api-key") != null ? "Configured" : "Not configured"));
        sender.sendMessage(ChatColor.GRAY + "Cooldown: " + ChatColor.WHITE + 
            plugin.getConfig().getInt("cooldown.seconds") + " seconds");
        sender.sendMessage(ChatColor.GRAY + "Logging: " + ChatColor.WHITE + 
            (plugin.getConfig().getBoolean("logging.enabled") ? "Enabled" : "Disabled"));
        return true;
    }

    private boolean handleTest(CommandSender sender) {
        sender.sendMessage(ChatColor.YELLOW + "Running network connectivity tests...");
        sender.sendMessage(ChatColor.GRAY + "Check the server console for detailed results.");
        
        // Run tests in a separate thread to avoid blocking
        plugin.getServer().getScheduler().runTaskAsynchronously(plugin, () -> {
            NetworkTest.testConnectivity(plugin);
        });
        
        return true;
    }

    private boolean handleDns(CommandSender sender) {
        sender.sendMessage(ChatColor.YELLOW + "Testing DNS resolution...");
        
        // Run DNS test in a separate thread
        plugin.getServer().getScheduler().runTaskAsynchronously(plugin, () -> {
            // Test your specific domain
            testDomain("erdconvorgeupvavlwv.supabase.co", "Your Supabase Project");
            
            // Test general Supabase domain
            testDomain("supabase.co", "Supabase Main Domain");
            
            // Test a known working domain
            testDomain("google.com", "Google (Control Test)");
        });
        
        return true;
    }
    
    private void testDomain(String domain, String description) {
        try {
            InetAddress address = InetAddress.getByName(domain);
            
            plugin.getLogger().info("✓ " + description + " - DNS Resolution successful");
            plugin.getLogger().info("  Domain: " + domain);
            plugin.getLogger().info("  IP Address: " + address.getHostAddress());
            
        } catch (Exception e) {
            plugin.getLogger().warning("✗ " + description + " - DNS Resolution failed");
            plugin.getLogger().warning("  Domain: " + domain);
            plugin.getLogger().warning("  Error: " + e.getMessage());
        }
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (!sender.hasPermission("tokenlink.admin")) {
            return new ArrayList<>();
        }

        if (args.length == 1) {
            List<String> completions = Arrays.asList("reload", "status", "test", "dns");
            List<String> filtered = new ArrayList<>();
            String input = args[0].toLowerCase();
            
            for (String completion : completions) {
                if (completion.startsWith(input)) {
                    filtered.add(completion);
                }
            }
            
            return filtered;
        }

        return new ArrayList<>();
    }
} 