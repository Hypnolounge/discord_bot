import bot from "../index";

export default async function getGuild(
  guildID: string = process.env.GUILD_ID || ""
) {
  try {
    return await bot.guilds.fetch(guildID);
  } catch (e) {
    console.error(e);
    return null;
  }
}
