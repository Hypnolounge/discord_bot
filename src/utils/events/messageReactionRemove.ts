import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import bot from "src";

export interface Callback {
  (
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ): any;
}

const register: { [key: string]: Callback } = {};

export function initializeMessageReactionRemove() {
  bot.on("messageReactionRemove", async (reaction, user) => {
    if (reaction.message.guildId !== process.env.GUILD_ID) return;
    if (user.bot) return;
    if (reaction.message.channel.isThread()) return;

    const handler = register[reaction.message.id];
    if (!handler) return;
    handler(reaction, user);
  });
}

export default function bindMessageReactionRemove(
  messageID: string,
  callback: Callback
) {
  register[messageID] = callback;
}
