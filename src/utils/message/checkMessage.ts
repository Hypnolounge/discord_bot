import { ActionRowBuilder, EmbedBuilder, TextBasedChannel } from "discord.js";
import createMessage from "./createMessage";
import getMessage from "./getMessage";
import updateMessage from "./updateMessage";

export interface MessageOptions {
  content?: string;
  embeds?: EmbedBuilder[];
  components?: ActionRowBuilder<any>[];
}

export default async function checkMessage(
  name: string,
  channel: TextBasedChannel,
  options: MessageOptions
) {
  const oldMessage = await getMessage(name, channel);
  if (oldMessage) {
    return await updateMessage(oldMessage, options);
  } else {
    return await createMessage(name, channel, options);
  }
}
