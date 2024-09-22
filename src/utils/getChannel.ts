import { log_error } from "./error";
import getGuild from "./getGuild";

export default async function getChannel(
  channelID: string,
  type: "text" | "voice" | "dm" = "text",
  guildID?: string
) {
  const guildObject = await getGuild(guildID);

  try {
    const channel = await guildObject.channels.fetch(channelID);
    if (!channel) {
      throw new Error(`Channel not found with ID ${channelID}`);
    }

    if (type === "text" && channel.isTextBased()) {
      return channel;
    }

    if (type === "voice" && channel.isVoiceBased()) {
      return channel;
    }

    if (type === "dm" && channel.isDMBased()) {
      return channel;
    }

    throw new Error(`Channel ${channelID} is not of type ${type}`);
  } catch (e) {
    log_error(e);
    throw new Error(`Channel not found with ID ${channelID}`);
  }
}
