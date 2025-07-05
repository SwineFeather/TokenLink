package com.tokenlink.login;

import net.md_5.bungee.api.chat.ClickEvent;
import net.md_5.bungee.api.chat.TextComponent;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.UUID;
import java.util.logging.Logger;

public class LoginCommand implements CommandExecutor {
    private final TokenLinkPlugin plugin;
    private final Logger logger;

    public LoginCommand(TokenLinkPlugin plugin) {
        this.plugin = plugin;
        this.logger = plugin.getLogger();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(ChatColor.RED + "This command is for players only!");
            return true;
        }

        Player player = (Player) sender;
        CooldownManager cooldownManager = plugin.getCooldownManager();

        if (cooldownManager.isOnCooldown(player.getUniqueId())) {
            player.sendMessage(ChatColor.RED + "Please wait before using /login again!");
            return true;
        }

        try {
            String token = UUID.randomUUID().toString();
            boolean success = plugin.getSupabaseClient().storeToken(
                player.getUniqueId().toString(), 
                player.getName(), 
                token
            );

            if (!success) {
                player.sendMessage(ChatColor.RED + "Failed to generate login link. Try again later.");
                return true;
            }

            String url = "https://mc.nordics.world/login?token=" + token;
            TextComponent message = new TextComponent(ChatColor.GREEN + "Click here to log in!");
            message.setClickEvent(new ClickEvent(ClickEvent.Action.OPEN_URL, url));
            player.spigot().sendMessage(message);

            cooldownManager.setCooldown(player.getUniqueId());
            if (plugin.isLoggingEnabled()) {
                logger.info("Login attempt for " + player.getName() + " (" + player.getUniqueId() + ") with token " + token);
            }

        } catch (Exception e) {
            player.sendMessage(ChatColor.RED + "An error occurred. Please try again.");
            if (plugin.isLoggingEnabled()) {
                logger.warning("Error generating login for " + player.getName() + ": " + e.getMessage());
            }
        }

        return true;
    }
}