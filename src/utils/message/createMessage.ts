import { log_error } from "@utils/error";
import { MessageCreateOptions, TextBasedChannel } from "discord.js";
import { setKeyValue } from "src/db/keyValueStore";

export default async function createMessage(
  name: string,
  channel: TextBasedChannel,
  options: MessageCreateOptions
) {
  try {
    const message = await channel.send(options);
    setKeyValue(name, message.id, "messageID");
    return message;
  } catch (e) {
    log_error(e);
    throw new Error(`Message not sent in channel ${channel.url}`);
  }
}
