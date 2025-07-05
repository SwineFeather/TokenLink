package com.tokenlink.login;

import java.util.HashMap;
import java.util.UUID;

public class CooldownManager {
    private final HashMap<UUID, Long> cooldowns = new HashMap<>();
    private final long cooldownSeconds;

    public CooldownManager(long cooldownSeconds) {
        this.cooldownSeconds = cooldownSeconds;
    }

    public boolean isOnCooldown(UUID playerUuid) {
        Long lastUsed = cooldowns.get(playerUuid);
        if (lastUsed == null) return false;
        return (System.currentTimeMillis() - lastUsed) / 1000 < cooldownSeconds;
    }

    public void setCooldown(UUID playerUuid) {
        cooldowns.put(playerUuid, System.currentTimeMillis());
    }
} 