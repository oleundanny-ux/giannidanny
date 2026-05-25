import {
  EmbedBuilder,
  GuildMember,
  type ColorResolvable,
  type Guild,
  type User,
} from "discord.js";
import { BotColors } from "./colors.js";

const BOT_FOOTER = "🛡️ Guardian Bot • Protection System";

export function successEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BotColors.GREEN as ColorResolvable)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: BOT_FOOTER });
}

export function errorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BotColors.RED as ColorResolvable)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: BOT_FOOTER });
}

export function warningEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BotColors.YELLOW as ColorResolvable)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: BOT_FOOTER });
}

export function infoEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BotColors.BLURPLE as ColorResolvable)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: BOT_FOOTER });
}

export function raidAlertEmbed(guild: Guild, joinCount: number): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BotColors.RED as ColorResolvable)
    .setTitle("🚨 RAID DETECTED — SERVER LOCKDOWN ACTIVATED")
    .setDescription(
      `> **${joinCount}** korisnika je ušlo za manje od **10 sekundi**!\n> Server je automatski zaključan na **5 minuta**.`,
    )
    .addFields(
      { name: "🏰 Server", value: guild.name, inline: true },
      { name: "👥 Mass Join", value: `${joinCount} korisnika`, inline: true },
      {
        name: "⏱️ Lockdown trajanje",
        value: "5 minuta (auto-unlock)",
        inline: true,
      },
    )
    .setThumbnail(guild.iconURL() ?? null)
    .setTimestamp()
    .setFooter({ text: "🛡️ Anti-Raid System • Guardian Bot" });
}

export function raidUnlockEmbed(guild: Guild): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(BotColors.GREEN as ColorResolvable)
    .setTitle("✅ Lockdown završen — Server je ponovo otvorен")
    .setDescription(
      `> Server **${guild.name}** je automatski otključan nakon 5 minuta.\n> Raid zaštita ostaje aktivna.`,
    )
    .setTimestamp()
    .setFooter({ text: "🛡️ Anti-Raid System • Guardian Bot" });
}

export function inviteDeleteEmbed(
  member: GuildMember | User,
  channelName: string,
): EmbedBuilder {
  const tag =
    member instanceof GuildMember ? member.user.tag : member.tag;
  const avatar =
    member instanceof GuildMember
      ? member.user.displayAvatarURL()
      : member.displayAvatarURL();
  return new EmbedBuilder()
    .setColor(BotColors.ORANGE as ColorResolvable)
    .setTitle("🔗 Invite Link Blokiran")
    .setDescription(
      `> Korisnik **${tag}** je pokušao da pošalje invite link u kanalu **#${channelName}**.\n> Poruka je automatski obrisana.`,
    )
    .setThumbnail(avatar)
    .setTimestamp()
    .setFooter({ text: "🛡️ Anti-Invite System • Guardian Bot" });
}

export function giveawayStartEmbed(
  prize: string,
  winners: number,
  endTime: Date,
  hostedBy: User,
): EmbedBuilder {
  const timestamp = Math.floor(endTime.getTime() / 1000);
  return new EmbedBuilder()
    .setColor(BotColors.PINK as ColorResolvable)
    .setTitle("🎉 GIVEAWAY 🎉")
    .setDescription(
      `## ${prize}\n\n` +
        `> Reaguj sa 🎉 da učestvuješ!\n\n` +
        `⏰ **Završava se:** <t:${timestamp}:R> (<t:${timestamp}:f>)\n` +
        `🏆 **Broj pobednika:** ${winners}\n` +
        `🎊 **Organizuje:** ${hostedBy}`,
    )
    .setThumbnail("https://cdn.discordapp.com/emojis/738049236830036000.png")
    .setTimestamp(endTime)
    .setFooter({ text: `🎁 Završava se` });
}

export function giveawayEndEmbed(
  prize: string,
  winners: string[],
): EmbedBuilder {
  const winnersText =
    winners.length > 0
      ? winners.map((w) => `<@${w}>`).join(", ")
      : "Nema pobednika (niko nije reagovao)";
  return new EmbedBuilder()
    .setColor(BotColors.GOLD as ColorResolvable)
    .setTitle("🏆 GIVEAWAY ZAVRŠEN 🏆")
    .setDescription(
      `## ${prize}\n\n` +
        `🎉 **Pobednik(ci):** ${winnersText}\n\n` +
        `*Čestitamo svim pobednicima!*`,
    )
    .setTimestamp()
    .setFooter({ text: "🎁 Guardian Bot • Giveaway System" });
}

export function giveawayRerollEmbed(
  prize: string,
  newWinners: string[],
): EmbedBuilder {
  const winnersText =
    newWinners.length > 0
      ? newWinners.map((w) => `<@${w}>`).join(", ")
      : "Nema pobednika";
  return new EmbedBuilder()
    .setColor(BotColors.CYAN as ColorResolvable)
    .setTitle("🔄 REROLL — Novi pobednici!")
    .setDescription(
      `## ${prize}\n\n` +
        `🎉 **Novi pobednik(ci):** ${winnersText}\n\n` +
        `*Novi pobednici su odabrani!*`,
    )
    .setTimestamp()
    .setFooter({ text: "🎁 Guardian Bot • Giveaway Reroll" });
}

export function eventsEmbed(
  guild: Guild,
  events: Array<{
    name: string;
    description: string | null;
    startTime: Date;
    endTime: Date | null;
    location: string | null;
    userCount: number | null;
  }>,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(BotColors.BLURPLE as ColorResolvable)
    .setTitle(`📅 Predstojeći događaji — ${guild.name}`)
    .setThumbnail(guild.iconURL() ?? null)
    .setTimestamp()
    .setFooter({ text: "📅 Guardian Bot • Events System" });

  if (events.length === 0) {
    embed.setDescription(
      "> Trenutno nema zakazanih događaja na ovom serveru.",
    );
    return embed;
  }

  embed.setDescription(
    `> Pronađeno **${events.length}** predstojeći(h) događaja na serveru **${guild.name}**\n\u200b`,
  );

  for (const event of events.slice(0, 10)) {
    const startTs = Math.floor(event.startTime.getTime() / 1000);
    const endTs = event.endTime
      ? Math.floor(event.endTime.getTime() / 1000)
      : null;
    const locationStr = event.location ? `📍 ${event.location}` : "📍 Discord";
    const endStr = endTs ? `\n⏰ Završava se: <t:${endTs}:R>` : "";
    const countStr = event.userCount != null ? `\n👥 Zainteresovanih: **${event.userCount}**` : "";
    embed.addFields({
      name: `🎪 ${event.name}`,
      value:
        `${event.description ? `> ${event.description.slice(0, 80)}${event.description.length > 80 ? "..." : ""}\n` : ""}` +
        `🗓️ Počinje: <t:${startTs}:F>` +
        endStr +
        `\n${locationStr}` +
        countStr,
      inline: false,
    });
  }

  return embed;
}
