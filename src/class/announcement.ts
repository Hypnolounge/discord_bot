import { TextChannelGroup } from "@typings/TextChannelGroup";
import bindMessageCreated from "@utils/events/messageCreated";
import formatString from "@utils/formatString";
import sleep from "@utils/sleep";
import { Message, MessageType, Role } from "discord.js";

export class Announcement {
  channel: TextChannelGroup;
  rolePings: Role[];

  constructor(channel: TextChannelGroup, rolePings: Role[] = []) {
    this.channel = channel;
    this.rolePings = rolePings;
  }

  async init() {
    bindMessageCreated(this.channel.id, async (message) => {
      if (message.system) return;
      await sleep(10000);
      try {
        const exists = await this.channel.messages.fetch(message.id);
        if (!exists) return;
        this.announce(message);
      } catch (e) {}
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

  constructor(channel: TextChannelGroup, announceMessage: string) {
    super(channel);
    this.announceMessage = announceMessage;
  }

  async init() {
    bindMessageCreated(this.channel.id, async (message) => {
      if (message.type !== MessageType.GuildBoost) return;

      this.announce(message);
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
