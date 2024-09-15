import { Guild } from "discord.js";
import getGuild from "./getGuild";

export default async function getRole(
  role: string,
  guildID?: string,
  guild?: Guild
) {
  const guildObject = guild || (await getGuild(guildID));
  if (!guildObject) return null;
  try {
    return await guildObject.roles.fetch(role);
  } catch (e) {
    console.error(e);
    return null;
  }
}
