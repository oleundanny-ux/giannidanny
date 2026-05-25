import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  ChannelType,
  type TextChannel,
  type Message,
} from "discord.js";
import {
  giveawayStartEmbed,
  giveawayEndEmbed,
  giveawayRerollEmbed,
  errorEmbed,
  successEmbed,
} from "../utils/embeds.js";
import { logger } from "../../lib/logger.js";

interface GiveawayData {
  messageId: string;
  channelId: string;
  guildId: string;
  prize: string;
  winners: number;
  endTime: Date;
  hostedBy: string;
  ended: boolean;
}

const activeGiveaways = new Map<string, GiveawayData>();

async function pickWinners(
  message: Message,
  count: number,
): Promise<string[]> {
  try {
    const reaction = message.reactions.cache.get("🎉");
    if (!reaction) return [];
    const users = await reaction.users.fetch();
    const eligible = users.filter((u) => !u.bot).map((u) => u.id);
    if (eligible.length === 0) return [];
    const shuffled = eligible.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch {
    return [];
  }
}

async function endGiveaway(
  giveaway: GiveawayData,
  channel: TextChannel,
): Promise<void> {
  giveaway.ended = true;

  let message: Message | null = null;
  try {
    message = await channel.messages.fetch(giveaway.messageId);
  } catch {
    return;
  }

  const winners = await pickWinners(message, giveaway.winners);

  await message.edit({
    embeds: [giveawayEndEmbed(giveaway.prize, winners)],
  });

  const winnersText =
    winners.length > 0
      ? `🎉 Pobednik(ci): ${winners.map((w) => `<@${w}>`).join(", ")}`
      : "Nema pobednika — niko nije reagovao.";

  await channel.send({
    content: `🏆 **GIVEAWAY ZAVRŠEN** — ${giveaway.prize}\n${winnersText}`,
    reply: { messageReference: giveaway.messageId },
  });

  logger.info({ giveawayId: giveaway.messageId, winners }, "Giveaway ended");
}

export const data = new SlashCommandBuilder()
  .setName("gws")
  .setDescription("🎉 Giveaway sistem")
  .addSubcommand((sub) =>
    sub
      .setName("create")
      .setDescription("🎁 Pokreni novi giveaway")
      .addStringOption((opt) =>
        opt
          .setName("nagrada")
          .setDescription("Šta se osvaja?")
          .setRequired(true),
      )
      .addIntegerOption((opt) =>
        opt
          .setName("trajanje")
          .setDescription("Trajanje u minutima (npr. 60)")
          .setMinValue(1)
          .setMaxValue(43200)
          .setRequired(true),
      )
      .addIntegerOption((opt) =>
        opt
          .setName("pobednici")
          .setDescription("Broj pobednika (default: 1)")
          .setMinValue(1)
          .setMaxValue(20)
          .setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName("end")
      .setDescription("🛑 Završi giveaway pre vremena")
      .addStringOption((opt) =>
        opt
          .setName("message_id")
          .setDescription("ID poruke giveaway-a")
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName("reroll")
      .setDescription("🔄 Rerollaj pobednike giveaway-a")
      .addStringOption((opt) =>
        opt
          .setName("message_id")
          .setDescription("ID poruke giveaway-a")
          .setRequired(true),
      ),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      embeds: [errorEmbed("Greška", "Ova komanda radi samo na serverima.")],
      ephemeral: true,
    });
    return;
  }

  const sub = interaction.options.getSubcommand();

  if (sub === "create") {
    const prize = interaction.options.getString("nagrada", true);
    const durationMin = interaction.options.getInteger("trajanje", true);
    const winnersCount = interaction.options.getInteger("pobednici") ?? 1;

    if (
      interaction.channel?.type !== ChannelType.GuildText
    ) {
      await interaction.reply({
        embeds: [
          errorEmbed("Greška", "Giveaway se može pokrenuti samo u tekst kanalima."),
        ],
        ephemeral: true,
      });
      return;
    }

    const endTime = new Date(Date.now() + durationMin * 60 * 1000);
    const embed = giveawayStartEmbed(prize, winnersCount, endTime, interaction.user);

    await interaction.reply({
      embeds: [
        successEmbed(
          "Giveaway pokrenut!",
          `🎉 Giveaway za **${prize}** je počeo u ovom kanalu!`,
        ),
      ],
      ephemeral: true,
    });

    const msg = await (interaction.channel as TextChannel).send({
      embeds: [embed],
    });

    await msg.react("🎉");

    const giveaway: GiveawayData = {
      messageId: msg.id,
      channelId: msg.channelId,
      guildId: interaction.guild.id,
      prize,
      winners: winnersCount,
      endTime,
      hostedBy: interaction.user.id,
      ended: false,
    };

    activeGiveaways.set(msg.id, giveaway);

    setTimeout(async () => {
      const current = activeGiveaways.get(msg.id);
      if (!current || current.ended) return;
      await endGiveaway(current, interaction.channel as TextChannel);
    }, durationMin * 60 * 1000);

    logger.info(
      { giveawayId: msg.id, prize, durationMin, winnersCount },
      "Giveaway created",
    );
    return;
  }

  if (sub === "end") {
    const messageId = interaction.options.getString("message_id", true);
    const giveaway = activeGiveaways.get(messageId);

    if (!giveaway) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Giveaway nije pronađen",
            "Provjeri ID poruke — giveaway možda već nije aktivan ili je ID pogrešan.",
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (giveaway.ended) {
      await interaction.reply({
        embeds: [errorEmbed("Giveaway je već završen", "Ovaj giveaway je već završio.")],
        ephemeral: true,
      });
      return;
    }

    if (interaction.channel?.type !== ChannelType.GuildText) return;

    await interaction.deferReply({ ephemeral: true });
    await endGiveaway(giveaway, interaction.channel as TextChannel);
    await interaction.editReply({
      embeds: [successEmbed("Giveaway završen", `Giveaway za **${giveaway.prize}** je ručno završen.`)],
    });
    return;
  }

  if (sub === "reroll") {
    const messageId = interaction.options.getString("message_id", true);
    const giveaway = activeGiveaways.get(messageId);

    if (!giveaway) {
      await interaction.reply({
        embeds: [
          errorEmbed(
            "Giveaway nije pronađen",
            "Provjeri ID poruke.",
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (interaction.channel?.type !== ChannelType.GuildText) return;

    await interaction.deferReply({ ephemeral: true });

    let message: Message | null = null;
    try {
      message = await (interaction.channel as TextChannel).messages.fetch(messageId);
    } catch {
      await interaction.editReply({
        embeds: [errorEmbed("Greška", "Nije moguće učitati poruku giveaway-a.")],
      });
      return;
    }

    const newWinners = await pickWinners(message, giveaway.winners);
    const embed = giveawayRerollEmbed(giveaway.prize, newWinners);

    await (interaction.channel as TextChannel).send({
      embeds: [embed],
      reply: { messageReference: messageId },
    });

    await interaction.editReply({
      embeds: [
        successEmbed(
          "Reroll završen",
          `Novi pobednici za **${giveaway.prize}** su odabrani!`,
        ),
      ],
    });

    logger.info({ giveawayId: messageId, newWinners }, "Giveaway rerolled");
    return;
  }
}
