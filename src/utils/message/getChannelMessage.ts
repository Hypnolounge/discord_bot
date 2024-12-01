import { getKeyValue } from "@db/keyValueStore";
import { TextChannelGroup } from "@typings/TextChannelGroup";
import { log_error } from "@utils/error";

export default async function getChannelMessage(
  name: string,
  channel: TextChannelGroup
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
