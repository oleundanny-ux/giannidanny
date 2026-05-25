import { type Client, ChannelType } from "discord.js";
import { logger } from "../../lib/logger.js";
import { inviteDeleteEmbed } from "../utils/embeds.js";

const INVITE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discordapp\.com\/invite)\/[a-zA-Z0-9-]+/gi;

export function registerAntiInvite(client: Client): void {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.channel.type !== ChannelType.GuildText) return;

    if (!INVITE_REGEX.test(message.content)) return;
    INVITE_REGEX.lastIndex = 0;

    const member = message.member;
    if (!member) return;

    if (member.permissions.has("ManageGuild")) return;

    try {
      await message.delete();
    } catch {
      return;
    }

    const channelName = message.channel.name;
    const embed = inviteDeleteEmbed(member, channelName);

    try {
      await message.channel.send({
        content: `${message.author} ⚠️ Slanje invite linkova nije dozvoljeno!`,
        embeds: [embed],
      });
    } catch (err) {
      logger.warn({ err }, "Could not send invite warning");
    }

    logger.info(
      { userId: message.author.id, guildId: message.guild.id, channelName },
      "Invite link deleted",
    );
  });
}
