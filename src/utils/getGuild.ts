import { Guild } from "discord.js";
import bot from "../index";

var guild: Guild | undefined;

export default async function getGuild(
  guildID: string = process.env.GUILD_ID || ""
) {
  if (guild) return guild;
  guild = await bot.guilds.fetch(guildID);
  return guild;
}