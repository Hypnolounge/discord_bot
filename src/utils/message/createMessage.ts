import { TextChannelGroup } from "@typings/TextChannelGroup";
import { log_error } from "@utils/error";
import { MessageCreateOptions } from "discord.js";
import { setKeyValue } from "@db/keyValueStore";

export default async function createMessage(
  name: string,
  channel: TextChannelGroup,
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
