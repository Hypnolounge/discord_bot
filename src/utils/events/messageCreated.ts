import { Message } from "discord.js";
import bot from "src";

export interface Callback {
  (message: Message): any;
}

const register: { [key: string]: Callback } = {};

export function initializeMessageCreated() {
  bot.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;
    if (message.channel.isThread()) return;

    const handler = register[message.channel.id];
    if (!handler) return;
    handler(message);
  });
}

export default function bindMessageCreated(channelID: string, callback: Callback) {
  register[channelID] = callback;
}
