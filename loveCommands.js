import { EmbedBuilder, ChannelType, } from "discord.js";
import { logger } from "../../lib/logger.js";
const BotColors = {
    LOVE: 0xff4d6d,
    SHIP: 0xff85a1,
    HUG: 0xffb347,
    SLAP: 0xff6b35,
    PAT: 0xffd166,
    KISS: 0xff6eb4,
    BITE: 0xc9184a,
    POKE: 0x74c0fc,
    CUDDLE: 0xf8a5c2,
    MARRY: 0xf9c74f,
    DANCE: 0x9b72cf,
    WAVE: 0x48cae4,
    CRY: 0x4895ef,
    BLUSH: 0xff9a9e,
    HIGHFIVE: 0x52b788,
    FEED: 0xa8dadc,
    STARE: 0x6c757d,
    ROAST: 0xfd7f20,
};
const marriages = new Map();
function shipPercent(id1, id2) {
    const seed = [...`${id1}${id2}`].reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((seed * 7 + 13) % 101 + 100) % 101;
}
function lovePercent(id1, id2) {
    const seed = [...`${id1}love${id2}`].reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((seed * 11 + 37) % 101 + 100) % 101;
}
function heartBar(percent) {
    const filled = Math.round(percent / 10);
    return "❤️".repeat(filled) + "🖤".repeat(10 - filled);
}
function shipLabel(percent) {
    if (percent >= 90)
        return "💍 Savršen par!";
    if (percent >= 75)
        return "💕 Jako dobro!";
    if (percent >= 60)
        return "😊 Solidno!";
    if (percent >= 40)
        return "🤔 Možda...";
    if (percent >= 25)
        return "😬 Teško...";
    return "💔 Nema šanse!";
}
function loveLabel(percent) {
    if (percent >= 90)
        return "💘 Totalno zaljubljen/a!";
    if (percent >= 75)
        return "💓 Jako voli!";
    if (percent >= 60)
        return "💛 Sviđa mu/joj se!";
    if (percent >= 40)
        return "💙 Simpatija!";
    if (percent >= 20)
        return "🌱 Možda nešto...";
    return "🥶 Hladno kao led!";
}
const ROAST_MESSAGES = [
    "je poslat/a na Marss bez povratne karte 🚀",
    "je bačen/a u crnu rupu ✨",
    "je izbačen/a iz galaksije 🌌",
    "je teleportovan/a na Antarktik 🧊",
    "je zatvoren/a u pixel 🖥️",
    "je pretvoren/a u meme 😂",
    "je poslan/a na vježbu u vojsku 🪖",
    "je zamijenjen/a AI botom 🤖",
    "je usput nestao/la u tunelu 🚇",
    "je bačen/a u zaborav ⚡",
];
function randomRoast() {
    return ROAST_MESSAGES[Math.floor(Math.random() * ROAST_MESSAGES.length)];
}
const SOCIAL_ACTIONS = {
    hug: {
        color: BotColors.HUG,
        emoji: "🤗",
        withTarget: [
            "{from} zagrlio/la {to}! Toplo i nježno! 🤗",
            "{from} daje {to} super zagrljaj! 💛",
            "{from} ne pušta {to} iz zagrljaja! 😭",
        ],
    },
    kiss: {
        color: BotColors.KISS,
        emoji: "💋",
        withTarget: [
            "{from} dao/dala {to} pusa na obraz! 💋",
            "{from} poslao/la {to} vazdušni cmok! 😘",
            "{from} poljubio/la {to} u čelo! 💖",
        ],
    },
    slap: {
        color: BotColors.SLAP,
        emoji: "👋",
        withTarget: [
            "{from} ošamario/la {to}! Boli! 👋",
            "{from} dao/dala {to} šamar prve klase! 💢",
            "{from} opalio/la {to} jako! ŠLJAP! 😤",
        ],
    },
    pat: {
        color: BotColors.PAT,
        emoji: "👆",
        withTarget: [
            "{from} milovao/la {to} po glavi! 👆",
            "{from} tapšao/la {to} - dobar si! 😊",
            "{from} dao/dala {to} nježan pat-pat! 💫",
        ],
    },
    poke: {
        color: BotColors.POKE,
        emoji: "👉",
        withTarget: [
            "{from} bo/la prst u {to}! Bockaaaaj! 👉",
            "{from} dirkao/la {to} da vidi je li živ/a 😂",
            "{from} lagano bodnuo/la {to} u bok! 👀",
        ],
    },
    bite: {
        color: BotColors.BITE,
        emoji: "🦷",
        withTarget: [
            "{from} ugrizao/la {to}! NOM NOM! 🦷",
            "{from} blago ugrize {to}. Zubi su oštri! 😬",
            "{from} dao/dala {to} mali ugriz! 🐭",
        ],
    },
    cuddle: {
        color: BotColors.CUDDLE,
        emoji: "🥰",
        withTarget: [
            "{from} se mazio/la sa {to}! Tako slatko! 🥰",
            "{from} zagrlio/la {to} i ne želi otiči! 💗",
            "{from} i {to} su se zmazali! Bože, preslatko! 😩",
        ],
    },
    blush: {
        color: BotColors.BLUSH,
        emoji: "😊",
        withTarget: [
            "{from} se zacrveni gledajući {to}! 😊",
            "{from} blago pocrvenio/la zbog {to}! ❤️",
            "{from} ne može prestati da se smiješi s {to}! 🌸",
        ],
    },
    wave: {
        color: BotColors.WAVE,
        emoji: "👋",
        withTarget: [
            "{from} maše {to}! Zdravo! 👋",
            "{from} pozdravlja {to} sa osmijehom! 😄",
            "{from} entuzijastično maše prema {to}! 🙌",
        ],
    },
    dance: {
        color: BotColors.DANCE,
        emoji: "💃",
        solo: [
            "{from} pleše sam/a! DISCO DISCO! 🕺",
            "{from} udario/la u ples! Niko ne može ga/je zaustaviti! 💃",
        ],
        withTarget: [
            "{from} poziva {to} na ples! 💃🕺",
            "{from} i {to} plešu zajedno! Odlično! 🎶",
            "{from} vodi {to} na plesni podij! ✨",
        ],
    },
    highfive: {
        color: BotColors.HIGHFIVE,
        emoji: "🙌",
        withTarget: [
            "{from} dao/dala high five sa {to}! 🙌 POGODAK!",
            "{from} i {to} — savršen high five! 🤜🤛",
            "{from} lebdeći high five za {to}! PAF! ✋",
        ],
    },
    feed: {
        color: BotColors.FEED,
        emoji: "🍕",
        withTarget: [
            "{from} hrani {to} — aaa, otvori usta! 🍕",
            "{from} donio/la {to} nešto ukusno! 🍱",
            "{from} priprema {to} kućni obrok! 🍳",
        ],
    },
    stare: {
        color: BotColors.STARE,
        emoji: "👀",
        withTarget: [
            "{from} buljio/la u {to}... dugo i uporno... 👀",
            "{from} ne može skinuti pogled s {to}! 😶",
            "{from} gleda {to} kao da nešto planira... 🤔",
        ],
    },
    cry: {
        color: BotColors.CRY,
        emoji: "😭",
        solo: [
            "{from} plače... ko ga/je utješi? 😭",
            "{from} je u suzama! Ne plači! 💧",
            "{from} je totalno razbijen/a! 😢",
        ],
        withTarget: [
            "{from} plače pred {to}! Utješi ih! 😭",
            "{from} izlio/izlila suze na {to}! 💦",
        ],
    },
    smile: {
        color: BotColors.LOVE,
        emoji: "😊",
        withTarget: [
            "{from} se nasmiješio/la na {to}! Sunce zasjalo! ☀️",
            "{from} daje {to} najljepši osmijeh! 😊",
            "{from} se topi od osmijeha prema {to}! 🌸",
        ],
    },
    lick: {
        color: BotColors.BITE,
        emoji: "👅",
        withTarget: [
            "{from} polizao/la {to} po obrazu! Šta?? 😂",
            "{from} liže {to} — nema objašnjenja! 😜",
            "{from} dao/dala {to} iznenadni lick! Weirdo! 😂",
        ],
    },
};
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function formatText(template, from, to) {
    return template
        .replace("{from}", `**${from.displayName}**`)
        .replace("{to}", to ? `**${to.displayName}**` : "**???**");
}
async function handleSocialAction(message, command, def) {
    const mentioned = message.mentions.users.first();
    if (!mentioned && !def.solo) {
        await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(def.color)
                    .setDescription(`${def.emoji} Moraš označiti nekoga! \`${command} @korisnik\``),
            ],
        });
        return;
    }
    const templates = mentioned
        ? def.withTarget
        : (def.solo ?? def.withTarget);
    const text = formatText(pickRandom(templates), message.author, mentioned ?? undefined);
    const embed = new EmbedBuilder()
        .setColor(def.color)
        .setDescription(text)
        .setTimestamp()
        .setFooter({ text: `💕 Love System • Guardian Bot` });
    await message.reply({ embeds: [embed] });
}
export function registerLoveCommands(client) {
    client.on("messageCreate", async (message) => {
        if (message.author.bot)
            return;
        if (message.channel.type !== ChannelType.GuildText)
            return;
        if (!message.content.startsWith("."))
            return;
        const args = message.content.slice(1).trim().split(/\s+/);
        const command = args[0]?.toLowerCase();
        if (!command)
            return;
        try {
            if (command === "ship") {
                const users = message.mentions.users;
                let u1;
                let u2;
                if (users.size >= 2) {
                    const arr = [...users.values()];
                    u1 = arr[0];
                    u2 = arr[1];
                }
                else if (users.size === 1) {
                    u1 = message.author;
                    u2 = users.first();
                }
                else {
                    await message.reply("`Koristi: .ship @korisnik1 @korisnik2`");
                    return;
                }
                const percent = shipPercent(u1.id, u2.id);
                const bar = heartBar(Math.round(percent / 10) * 10);
                const label = shipLabel(percent);
                const shipName = u1.displayName.slice(0, 3) + u2.displayName.slice(-3);
                const embed = new EmbedBuilder()
                    .setColor(BotColors.SHIP)
                    .setTitle(`💘 Ship: ${shipName}`)
                    .setDescription(`**${u1.displayName}** 💕 **${u2.displayName}**\n\n` +
                    `${bar}\n\n` +
                    `**${percent}%** kompatibilnosti\n` +
                    `*${label}*`)
                    .setThumbnail(u1.displayAvatarURL())
                    .setTimestamp()
                    .setFooter({ text: "💕 Love System • Guardian Bot" });
                await message.channel.send({ embeds: [embed] });
                return;
            }
            if (command === "love") {
                const mentioned = message.mentions.users.first();
                if (!mentioned) {
                    await message.reply("`Koristi: .love @korisnik`");
                    return;
                }
                const percent = lovePercent(message.author.id, mentioned.id);
                const bar = heartBar(Math.round(percent / 10) * 10);
                const label = loveLabel(percent);
                const embed = new EmbedBuilder()
                    .setColor(BotColors.LOVE)
                    .setTitle(`❤️ Love metar`)
                    .setDescription(`**${message.author.displayName}** ❤️ **${mentioned.displayName}**\n\n` +
                    `${bar}\n\n` +
                    `**${percent}%** ljubavi\n` +
                    `*${label}*`)
                    .setThumbnail(mentioned.displayAvatarURL())
                    .setTimestamp()
                    .setFooter({ text: "💕 Love System • Guardian Bot" });
                await message.channel.send({ embeds: [embed] });
                return;
            }
            if (command === "marry") {
                const mentioned = message.mentions.users.first();
                if (!mentioned) {
                    await message.reply("`Koristi: .marry @korisnik`");
                    return;
                }
                if (mentioned.id === message.author.id) {
                    await message.reply("❌ Ne možeš se vjenčati sam/a sa sobom!");
                    return;
                }
                const existingPartner = marriages.get(message.author.id);
                if (existingPartner) {
                    await message.reply(`❌ Već si u braku! Koristi \`.divorce\` da se razvedeš prvo.`);
                    return;
                }
                if (marriages.get(mentioned.id)) {
                    await message.reply(`❌ **${mentioned.displayName}** je već u braku!`);
                    return;
                }
                marriages.set(message.author.id, mentioned.id);
                marriages.set(mentioned.id, message.author.id);
                const embed = new EmbedBuilder()
                    .setColor(BotColors.MARRY)
                    .setTitle("💍 Vjenčanje!")
                    .setDescription(`🎊 **${message.author.displayName}** i **${mentioned.displayName}** su sada **u braku**!\n\n` +
                    `> Čestitamo mladencima! 💒\n\n` +
                    `*Koristi \`.divorce\` za razvod.*`)
                    .setThumbnail(mentioned.displayAvatarURL())
                    .setTimestamp()
                    .setFooter({ text: "💍 Love System • Guardian Bot" });
                await message.channel.send({ embeds: [embed] });
                return;
            }
            if (command === "divorce") {
                const partnerId = marriages.get(message.author.id);
                if (!partnerId) {
                    await message.reply("❌ Nisi u braku!");
                    return;
                }
                marriages.delete(message.author.id);
                marriages.delete(partnerId);
                const embed = new EmbedBuilder()
                    .setColor(0x6c757d)
                    .setTitle("💔 Razvod")
                    .setDescription(`**${message.author.displayName}** je zatražio/la razvod.\n\n` +
                    `> Brak je završen. Sretno u daljem životu! 🕊️`)
                    .setTimestamp()
                    .setFooter({ text: "💔 Love System • Guardian Bot" });
                await message.channel.send({ embeds: [embed] });
                return;
            }
            if (command === "partner") {
                const targetUser = message.mentions.users.first() ?? message.author;
                const partnerId = marriages.get(targetUser.id);
                if (!partnerId) {
                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0x6c757d)
                                .setDescription(`💔 **${targetUser.displayName}** trenutno nije u braku.`),
                        ],
                    });
                    return;
                }
                try {
                    const partner = await client.users.fetch(partnerId);
                    const embed = new EmbedBuilder()
                        .setColor(BotColors.MARRY)
                        .setTitle("💍 Bračni status")
                        .setDescription(`**${targetUser.displayName}** je u braku sa **${partner.displayName}**! 💒`)
                        .setThumbnail(partner.displayAvatarURL())
                        .setTimestamp()
                        .setFooter({ text: "💍 Love System • Guardian Bot" });
                    await message.reply({ embeds: [embed] });
                }
                catch {
                    await message.reply("❌ Greška pri učitavanju partnera.");
                }
                return;
            }
            if (command === "fuck") {
                const mentioned = message.mentions.users.first();
                if (!mentioned) {
                    await message.reply("`Koristi: .fuck @korisnik`");
                    return;
                }
                if (mentioned.id === message.author.id) {
                    await message.reply("🤦 Nemoguće je 'fuckati' samog/samu sebe.");
                    return;
                }
                const roast = randomRoast();
                const embed = new EmbedBuilder()
                    .setColor(BotColors.ROAST)
                    .setTitle("🚀 Odleti!")
                    .setDescription(`**${message.author.displayName}** šalje **${mentioned.displayName}** na put!\n\n` +
                    `> **${mentioned.displayName}** ${roast}`)
                    .setTimestamp()
                    .setFooter({ text: "😂 Love System • Guardian Bot" });
                await message.channel.send({ embeds: [embed] });
                return;
            }
            if (command === "lovecmds" || command === "lovehelp") {
                const embed = new EmbedBuilder()
                    .setColor(BotColors.LOVE)
                    .setTitle("💕 Love & Social komande")
                    .setDescription("Sve dostupne love/social komande:")
                    .addFields({
                    name: "💘 Ljubav & Brak",
                    value: "`.ship @a @b` — kompatibilnost para\n" +
                        "`.love @a` — love metar\n" +
                        "`.marry @a` — vjenčaj se\n" +
                        "`.divorce` — razvedi se\n" +
                        "`.partner` — provjeri ko je čiji brak",
                    inline: false,
                }, {
                    name: "🤗 Nježne akcije",
                    value: "`.hug @a` — zagrli\n" +
                        "`.kiss @a` — daj pusa\n" +
                        "`.pat @a` — pomiluj po glavi\n" +
                        "`.cuddle @a` — mazi se\n" +
                        "`.blush @a` — zacrveni se\n" +
                        "`.smile @a` — nasmiješi se\n" +
                        "`.feed @a` — nahrani",
                    inline: true,
                }, {
                    name: "😂 Zabavne akcije",
                    value: "`.slap @a` — ošamari\n" +
                        "`.poke @a` — bockaj\n" +
                        "`.bite @a` — ugrizi\n" +
                        "`.lick @a` — poliži\n" +
                        "`.stare @a` — bulji\n" +
                        "`.wave @a` — mahni\n" +
                        "`.highfive @a` — high five",
                    inline: true,
                }, {
                    name: "🎭 Ostalo",
                    value: "`.dance` / `.dance @a` — pleši\n" +
                        "`.cry` / `.cry @a` — plači\n" +
                        "`.fuck @a` — pošalji nekoga u svemir 🚀",
                    inline: false,
                })
                    .setTimestamp()
                    .setFooter({ text: "💕 Love System • Guardian Bot" });
                await message.channel.send({ embeds: [embed] });
                return;
            }
            const actionDef = SOCIAL_ACTIONS[command];
            if (actionDef) {
                await handleSocialAction(message, command, actionDef);
                return;
            }
        }
        catch (err) {
            logger.error({ err, command }, "Love command error");
        }
    });
}
//# sourceMappingURL=loveCommands.js.map