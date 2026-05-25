import { SlashCommandBuilder, GuildScheduledEventStatus, } from "discord.js";
import { eventsEmbed } from "../utils/embeds.js";
import { errorEmbed, infoEmbed } from "../utils/embeds.js";
export const data = new SlashCommandBuilder()
    .setName("events")
    .setDescription("📅 Prikaži predstojeće događaje na serveru");
export async function execute(interaction) {
    if (!interaction.guild) {
        await interaction.reply({
            embeds: [errorEmbed("Greška", "Ova komanda je dostupna samo na serverima.")],
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply();
    try {
        const scheduledEvents = await interaction.guild.scheduledEvents.fetch();
        const upcoming = scheduledEvents
            .filter((e) => e.status === GuildScheduledEventStatus.Scheduled ||
            e.status === GuildScheduledEventStatus.Active)
            .map((e) => ({
            name: e.name,
            description: e.description,
            startTime: e.scheduledStartAt ?? new Date(),
            endTime: e.scheduledEndAt ?? null,
            location: e.entityMetadata?.location ??
                (e.channel ? `#${e.channel.name}` : null),
            userCount: e.userCount,
        }))
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        if (upcoming.length === 0) {
            await interaction.editReply({
                embeds: [
                    infoEmbed("Nema događaja", "Trenutno nema zakazanih događaja na ovom serveru.\n\nAdmini mogu kreirati događaje putem **Server Events** sekcije."),
                ],
            });
            return;
        }
        await interaction.editReply({
            embeds: [eventsEmbed(interaction.guild, upcoming)],
        });
    }
    catch (err) {
        await interaction.editReply({
            embeds: [
                errorEmbed("Greška", "Nije moguće učitati događaje. Provjeri da bot ima odgovarajuće dozvole."),
            ],
        });
    }
}
//# sourceMappingURL=events.js.map