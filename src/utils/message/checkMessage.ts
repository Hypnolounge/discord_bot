import { TextChannelGroup } from "@typings/TextChannelGroup";
import { ActionRowBuilder, EmbedBuilder } from "discord.js";
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
  channel: TextChannelGroup,
  options: MessageOptions
) {
  try {
    const oldMessage = await getMessage(name, channel);
    return await updateMessage(oldMessage, options);
  } catch {
    return await createMessage(name, channel, options);
  }
}
