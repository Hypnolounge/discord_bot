import getGuild from "./getGuild";

export default async function getChannel(channel: string) {
  const guild = await getGuild();
  if (!guild) return;
  return guild.channels.cache.get(channel) || (await guild.channels.fetch(channel));
}
