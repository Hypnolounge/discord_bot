import { Client, ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import { getKeyValue } from "../DB/keyValueStore";
import bot from "../index";
import { log_error } from "./error";

export class LogEntry {
  title: string;
  message: string;
  timestamp: Date;
  type: "info" | "error" | "warn";

  constructor(
    title: string,
    message: string,
    type: "info" | "error" | "warn" = "info"
  ) {
    this.title = title;
    this.message = message;
    this.timestamp = new Date();
    this.type = type;
  }
}

class Logger {
  client: Client;
  logChannel: TextChannel | undefined;
  colors: { [key: string]: ColorResolvable } = {
    info: "Blurple",
    error: "Red",
    warn: "Yellow",
  };

  constructor(client: Client) {
    this.client = client;
    this.init();
  }

  async init() {
    const logChannel = await getKeyValue("log_channel");
    if (!logChannel) return;

    this.logChannel = (await this.client.channels.fetch(
      logChannel
    )) as TextChannel;
  }

  public async log(message: LogEntry) {
    if (!this.logChannel) {
      await this.init();
      log_error("Log channel not found");
      return;
    }

    const embed = new EmbedBuilder()
      .setTimestamp(message.timestamp)
      .setTitle(message.title)
      .setDescription(message.message)
      .setFooter({ text: "PupNicky" })
      .setColor(this.colors[message.type]);

    await this.logChannel.send({ embeds: [embed] });
  }
}

export default new Logger(bot);
