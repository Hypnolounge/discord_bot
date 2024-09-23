import config from "@db/config";
import { TextChannelGroup } from "@typings/TextChannelGroup";
import { Client, ColorResolvable, EmbedBuilder } from "discord.js";
import bot from "../index";
import { log_error } from "./error";
import getChannel from "./getChannel";

export class LogEntry {
  title: string;
  message: string;
  error?: any;
  timestamp: Date;
  type: "info" | "error" | "warn";

  constructor(
    title: string,
    message: string,
    type: "info" | "error" | "warn" = "info",
    error?: any
  ) {
    this.title = title;
    this.message = message;
    this.timestamp = new Date();
    this.type = type;
    this.error = error;
  }
}

class Logger {
  client: Client;
  logChannel: TextChannelGroup | undefined;
  colors: { [key: string]: ColorResolvable } = {
    info: "Blurple",
    error: "Red",
    warn: "Yellow",
  };
  channelID: string;

  constructor(client: Client, channelID: string) {
    this.client = client;
    this.channelID = channelID;
  }

  async init() {
    try {
      const channel = await getChannel(this.channelID);
      this.logChannel = channel;
    } catch (e) {
      log_error(e);
    }
  }

  public async log(message: LogEntry | EmbedBuilder) {
    if (!this.logChannel) {
      return;
    }

    if (message instanceof EmbedBuilder) {
      message
        .setFooter({ text: "PupNicky" })
        .setColor(this.colors.info)
        .setTimestamp(new Date());

      await this.logChannel.send({ embeds: [message] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTimestamp(message.timestamp)
      .setTitle(message.title)
      .setDescription(message.message)
      .setFooter({ text: "PupNicky" })
      .setColor(this.colors[message.type]);

    if (message.error) {
      embed.addFields({ name: "Error", value: message.error.toString() });
    }

    await this.logChannel.send({ embeds: [embed] });
  }
}

export default new Logger(bot, config.channels.system_log);
export const TicketLogger = new Logger(bot, config.channels.ticket_log);
