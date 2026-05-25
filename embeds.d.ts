import { EmbedBuilder, GuildMember, type Guild, type User } from "discord.js";
export declare function successEmbed(title: string, description: string): EmbedBuilder;
export declare function errorEmbed(title: string, description: string): EmbedBuilder;
export declare function warningEmbed(title: string, description: string): EmbedBuilder;
export declare function infoEmbed(title: string, description: string): EmbedBuilder;
export declare function raidAlertEmbed(guild: Guild, joinCount: number): EmbedBuilder;
export declare function raidUnlockEmbed(guild: Guild): EmbedBuilder;
export declare function inviteDeleteEmbed(member: GuildMember | User, channelName: string): EmbedBuilder;
export declare function giveawayStartEmbed(prize: string, winners: number, endTime: Date, hostedBy: User): EmbedBuilder;
export declare function giveawayEndEmbed(prize: string, winners: string[]): EmbedBuilder;
export declare function giveawayRerollEmbed(prize: string, newWinners: string[]): EmbedBuilder;
export declare function eventsEmbed(guild: Guild, events: Array<{
    name: string;
    description: string | null;
    startTime: Date;
    endTime: Date | null;
    location: string | null;
    userCount: number | null;
}>): EmbedBuilder;
//# sourceMappingURL=embeds.d.ts.map