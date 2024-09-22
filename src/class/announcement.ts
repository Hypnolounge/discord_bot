import formatString from "@utils/formatString";
import sleep from "@utils/sleep";
import { Client, Message, MessageType, Role, TextBasedChannel } from "discord.js";

export class Announcement {
  client: Client;
  channel: TextBasedChannel;
  rolePings: Role[];

  constructor(client: Client, channel: TextBasedChannel, rolePings: Role[] = []) {
    this.client = client;
    this.channel = channel;
    this.rolePings = rolePings;
  }

  async init() {
    this.client.on("messageCreate", async (message) => {
      if (message.channel.id !== this.channel.id) return;
      if (message.author.bot) return;
      if (message.channel.isThread()) return;
      await sleep(10000);
      try{
        const exists = await this.channel.messages.fetch(message.id)
        if (!exists) return;
        this.announce(message);
      } catch (e) {
      }
    });
  }

  protected async announce(message: Message) {
    var content = message.content;

    this.rolePings.forEach(async (role) => {
      content += `\n<@&${role.id}>`;
    });

    const announce = await this.channel.send(content);
    await sleep(5000);
    await announce.delete();
  }
}

export class BoostAnnouncement extends Announcement {
  announceMessage: string;

  constructor(client: Client, channel: TextBasedChannel, announceMessage: string) {
    super(client, channel);
    this.announceMessage = announceMessage;
  }

  async init() {
    this.client.on("messageCreate", async (message) => {
      if (message.type !== MessageType.GuildBoost) return;
      if (message.author.bot) return;

      await this.announce(message);
    });
  }

  async announce(message: Message) {
    const content = formatString(this.announceMessage, {
      user: message.author.toString(),
    });
    const announce = await this.channel.send(content);
    await sleep(2000);
    await announce.delete();
  }
}