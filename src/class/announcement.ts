import { Client, Message, MessageType, Role, TextChannel } from "discord.js";
import sleep from "../utils/sleep";
import formatString from "../utils/formatString";

export default class Announcement {
  client: Client;
  channel: TextChannel;
  rolePings: Role[];

  constructor(client: Client, channel: TextChannel, rolePings: Role[] = []) {
    this.client = client;
    this.channel = channel;
    this.rolePings = rolePings;
    this.init();
  }

  async init() {
    this.client.on("messageCreate", async (message) => {
      if (message.channel.id !== this.channel.id) return;

      await this.announce(message);
    });
  }

  public async announce(message: Message) {
    var content = "";

    this.rolePings.forEach(async (role) => {
      content += `<@&${role.id}> `;
    });

    content += message.content;
    const announce = await this.channel.send(content);
    await sleep(2000);
    await announce.delete();
  }
}

export class BoostAnnouncement extends Announcement {
  announceMessage: string;

  constructor(client: Client, channel: TextChannel, announceMessage: string) {
    super(client, channel);
    this.announceMessage = announceMessage;
  }

  async init() {
    this.client.on("messageCreate", async (message) => {
      if (message.type !== MessageType.GuildBoost) return;

      await this.announce(message);
    });
  }

  public async announce(message: Message) {
    const content = formatString(this.announceMessage, {
      user: message.author.toString(),
    });
    const announce = await this.channel.send(content);
    await sleep(2000);
    await announce.delete();
  }
}