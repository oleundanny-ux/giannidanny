import {
  type Client,
  type GuildMember,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { logger } from "../../lib/logger.js";
import { raidAlertEmbed, raidUnlockEmbed } from "../utils/embeds.js";

const JOIN_THRESHOLD = 5;
const JOIN_WINDOW_MS = 10_000;
const LOCKDOWN_DURATION_MS = 5 * 60 * 1000;

const recentJoins = new Map<string, number[]>();
const lockdownGuilds = new Set<string>();

async function lockdownGuild(member: GuildMember): Promise<void> {
  const guild = member.guild;
  if (lockdownGuilds.has(guild.id)) return;
  lockdownGuilds.add(guild.id);

  logger.warn({ guildId: guild.id }, "Raid detected — activating lockdown");

  const channels = guild.channels.cache.filter(
    (ch) =>
      ch.type === ChannelType.GuildText &&
      ch.permissionsFor(guild.roles.everyone)?.has(PermissionFlagsBits.SendMessages),
  );

  for (const [, channel] of channels) {
    try {
      if (channel.type === ChannelType.GuildText) {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false,
        });
      }
    } catch {
      // skip channels we can't edit
    }
  }

  const systemChannel = guild.systemChannel;
  if (systemChannel) {
    const joinCount = recentJoins.get(guild.id)?.length ?? JOIN_THRESHOLD;
    await systemChannel.send({ embeds: [raidAlertEmbed(guild, joinCount)] });
  }

  setTimeout(async () => {
    try {
      for (const [, channel] of channels) {
        if (channel.type === ChannelType.GuildText) {
          await channel.permissionOverwrites.edit(guild.roles.everyone, {
            SendMessages: null,
          });
        }
      }
      lockdownGuilds.delete(guild.id);
      recentJoins.delete(guild.id);

      if (systemChannel) {
        await systemChannel.send({ embeds: [raidUnlockEmbed(guild)] });
      }
      logger.info({ guildId: guild.id }, "Lockdown lifted");
    } catch (err) {
      logger.error({ err }, "Error lifting lockdown");
    }
  }, LOCKDOWN_DURATION_MS);
}

export function registerAntiRaid(client: Client): void {
  client.on("guildMemberAdd", async (member) => {
    const guildId = member.guild.id;

    if (lockdownGuilds.has(guildId)) return;

    const now = Date.now();
    const joins = recentJoins.get(guildId) ?? [];
    const recentWindow = joins.filter((t) => now - t < JOIN_WINDOW_MS);
    recentWindow.push(now);
    recentJoins.set(guildId, recentWindow);

    logger.debug(
      { guildId, recentJoins: recentWindow.length },
      "Member joined",
    );

    if (recentWindow.length >= JOIN_THRESHOLD) {
      await lockdownGuild(member);
    }
  });
}
