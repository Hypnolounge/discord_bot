import { getKeyValue } from "@db/keyValueStore";
import { log_error } from "@utils/error";
import { TextBasedChannel } from "discord.js";

export default async function getMessage(
  name: string,
  channel: TextBasedChannel
) {
  const messageID = await getKeyValue(name, "messageID");
  if (!messageID) {
    throw new Error(`Message ID not found for ${name}`);
  }

  try {
    const message = await channel.messages.fetch(messageID);
    return message;
  } catch (e) {
    log_error(e);
    throw new Error(`Message ${messageID} not found in channel ${channel.url}`);
  }
}
