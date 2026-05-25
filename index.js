import { Client, GatewayIntentBits, REST, Routes, ActivityType, } from "discord.js";
import { logger } from "../lib/logger.js";
import { registerAntiRaid } from "./handlers/antiRaid.js";
import { registerAntiInvite } from "./handlers/antiInvite.js";
import { registerLoveCommands } from "./handlers/loveCommands.js";
import * as eventsCommand from "./commands/events.js";
import * as gwsCommand from "./commands/gws.js";
import { successEmbed } from "./utils/embeds.js";
const commands = [eventsCommand, gwsCommand];
export async function startBot() {
    const token = process.env["DISCORD_TOKEN"];
    if (!token) {
        logger.warn("DISCORD_TOKEN not set — bot will not start");
        return;
    }
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildScheduledEvents,
        ],
    });
    registerAntiRaid(client);
    registerAntiInvite(client);
    registerLoveCommands(client);
    client.once("ready", async (readyClient) => {
        logger.info({ tag: readyClient.user.tag }, "Discord bot ready");
        readyClient.user.setPresence({
            activities: [
                {
                    name: "🛡️ Server zaštita aktivna",
                    type: ActivityType.Watching,
                },
            ],
            status: "online",
        });
        const rest = new REST().setToken(token);
        const commandData = commands.map((c) => c.data.toJSON());
        try {
            await rest.put(Routes.applicationCommands(readyClient.user.id), {
                body: commandData,
            });
            logger.info("Slash commands registered globally");
        }
        catch (err) {
            logger.error({ err }, "Failed to register slash commands");
        }
        for (const guild of readyClient.guilds.cache.values()) {
            try {
                const systemChannel = guild.systemChannel;
                if (systemChannel) {
                    await systemChannel.send({
                        embeds: [
                            successEmbed("🛡️ Guardian Bot je online!", `Bot je uspješno pokrenut i spreman za zaštitu servera **${guild.name}**!\n\n` +
                                `**Aktivirani sistemi:**\n` +
                                `> 🚨 **Anti-Raid** — automatska zaštita od mass join napada\n` +
                                `> 🔗 **Anti-Invite** — blokiranje invite linkova u chatovima\n` +
                                `> 📅 \`/events\` — pregled serverskih događaja\n` +
                                `> 🎉 \`/gws\` — giveaway sistem (create / end / reroll)\n\n` +
                                `*Svi sistemi su aktivni i rade u realnom vremenu.*`),
                        ],
                    });
                }
            }
            catch {
                // skip guilds where we can't send
            }
        }
    });
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isChatInputCommand())
            return;
        const command = commands.find((c) => c.data.name === interaction.commandName);
        if (!command)
            return;
        try {
            await command.execute(interaction);
        }
        catch (err) {
            logger.error({ err, command: interaction.commandName }, "Command error");
            const errorPayload = {
                content: "❌ Greška pri izvršavanju komande. Pokušaj ponovo.",
                ephemeral: true,
            };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorPayload);
            }
            else {
                await interaction.reply(errorPayload);
            }
        }
    });
    client.on("error", (err) => {
        const msg = err.message ?? String(err);
        if (msg.includes("disallowed intents") || msg.includes("Disallowed intents")) {
            logger.error("❌ Privilegovani intenti nisu uključeni! Idi na:\n" +
                "   https://discord.com/developers/applications → tvoja aplikacija → Bot\n" +
                "   ✅ Uključi: SERVER MEMBERS INTENT\n" +
                "   ✅ Uključi: MESSAGE CONTENT INTENT\n" +
                "   Zatim restart workflow.");
        }
        else {
            logger.error({ err }, "Discord client error");
        }
    });
    client.on("warn", (info) => {
        logger.warn({ info }, "Discord client warning");
    });
    try {
        await client.login(token);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("disallowed intents") || msg.includes("Used disallowed")) {
            logger.error("\n\n" +
                "╔══════════════════════════════════════════════════════╗\n" +
                "║  ⚠️  PRIVILEGOVANI INTENTI NISU UKLJUČENI!           ║\n" +
                "║                                                      ║\n" +
                "║  Idi na Discord Developer Portal:                    ║\n" +
                "║  discord.com/developers/applications                 ║\n" +
                "║                                                      ║\n" +
                "║  → Tvoja aplikacija → Bot tab                       ║\n" +
                "║  ✅ Uključi: SERVER MEMBERS INTENT                  ║\n" +
                "║  ✅ Uključi: MESSAGE CONTENT INTENT                 ║\n" +
                "║                                                      ║\n" +
                "║  Sačuvaj pa restartuj ovaj workflow.                 ║\n" +
                "╚══════════════════════════════════════════════════════╝\n");
        }
        else {
            throw err;
        }
    }
}
//# sourceMappingURL=index.js.map