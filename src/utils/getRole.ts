import getGuild from "./getGuild";

export default async function getRole(role: string) {
  const guild = await getGuild();
  if (!guild) return;
  return guild.roles.cache.get(role) || (await guild.roles.fetch(role));
}
