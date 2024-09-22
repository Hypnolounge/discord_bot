import { log_error } from "@utils/error";
import { Message, MessageEditOptions } from "discord.js";

export default async function updateMessage(
  message: Message,
  options: MessageEditOptions
) {
  try {
    return await message.edit(options);
  } catch (e) {
    log_error(e);
    throw new Error(
      `Failed to update message ${message.id} in channel ${message.channel.url}`
    );
  }
}
