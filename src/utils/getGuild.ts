import config from "@db/config";
import bot from "../index";
import { log_error } from "./error";

export default async function getGuild(
  guildID: string = config.guild_id
) {
  try {
    return await bot.guilds.fetch(guildID);
  } catch (e) {
    log_error(e);
    throw new Error(`Guild not found with ID ${guildID}`);
  }
}
